/**
 * Système de sanitisation avancé pour la sécurité
 * Remplace les usages dangereux d'innerHTML et autres vulnérabilités
 */

import DOMPurify from 'dompurify';

interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
  removeScripts?: boolean;
  removeLinks?: boolean;
  removeImages?: boolean;
}

export class EnhancedSanitizer {
  private static instance: EnhancedSanitizer;
  private defaultConfig: DOMPurify.Config;

  private constructor() {
    this.defaultConfig = {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
        'table', 'thead', 'tbody', 'tr', 'td', 'th'
      ],
      ALLOWED_ATTR: ['class', 'id', 'href', 'title', 'alt'],
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover'],
      REMOVE_DATA_ATTR: false,
      REMOVE_UNKNOWN_PROTOCOL: true,
      USE_PROFILES: { html: true }
    };
  }

  static getInstance(): EnhancedSanitizer {
    if (!EnhancedSanitizer.instance) {
      EnhancedSanitizer.instance = new EnhancedSanitizer();
    }
    return EnhancedSanitizer.instance;
  }

  /**
   * Sanitise le contenu HTML de manière sécurisée
   */
  sanitizeHTML(html: string, options?: SanitizationOptions): string {
    if (!html) return '';

    const config = { ...this.defaultConfig };

    if (options?.allowedTags) {
      config.ALLOWED_TAGS = options.allowedTags;
    }

    if (options?.allowedAttributes) {
      const allowedAttrs: string[] = [];
      Object.values(options.allowedAttributes).forEach(attrs => {
        allowedAttrs.push(...attrs);
      });
      config.ALLOWED_ATTR = allowedAttrs;
    }

    if (options?.removeScripts) {
      config.FORBID_TAGS = [...(config.FORBID_TAGS || []), 'script'];
    }

    if (options?.removeLinks) {
      config.FORBID_TAGS = [...(config.FORBID_TAGS || []), 'a'];
    }

    if (options?.removeImages) {
      config.FORBID_TAGS = [...(config.FORBID_TAGS || []), 'img'];
    }

    return DOMPurify.sanitize(html, config);
  }

  /**
   * Sanitise le texte brut (échappe les caractères dangereux)
   */
  sanitizeText(text: string): string {
    if (!text) return '';

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Valide et sanitise une URL
   */
  sanitizeURL(url: string): string {
    if (!url) return '';

    // Supprimer les protocoles dangereux
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerUrl = url.toLowerCase();
    
    for (const protocol of dangerousProtocols) {
      if (lowerUrl.startsWith(protocol)) {
        return '#';
      }
    }

    // Valider le format URL
    try {
      const validUrl = new URL(url);
      return validUrl.href;
    } catch {
      return '#';
    }
  }

  /**
   * Sanitise les attributs CSS
   */
  sanitizeCSS(css: string): string {
    if (!css) return '';

    // Supprimer les expressions et fonctions dangereuses
    const dangerousPatterns = [
      /expression\s*\(/gi,
      /javascript\s*:/gi,
      /vbscript\s*:/gi,
      /data\s*:/gi,
      /import\s*['"]/gi,
      /@import/gi,
      /url\s*\(\s*['"]?javascript:/gi
    ];

    let sanitizedCSS = css;
    dangerousPatterns.forEach(pattern => {
      sanitizedCSS = sanitizedCSS.replace(pattern, '');
    });

    return sanitizedCSS;
  }

  /**
   * Valide et sanitise les données JSON
   */
  sanitizeJSON(jsonString: string): any {
    try {
      const parsed = JSON.parse(jsonString);
      return this.sanitizeObject(parsed);
    } catch {
      return null;
    }
  }

  /**
   * Sanitise récursivement un objet
   */
  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      return this.sanitizeText(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeText(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Valide les entrées de formulaire
   */
  validateFormInput(input: string, type: 'text' | 'email' | 'url' | 'number'): {
    isValid: boolean;
    sanitized: string;
    errors: string[];
  } {
    const errors: string[] = [];
    let sanitized = input;

    // Sanitisation de base
    sanitized = this.sanitizeText(sanitized);

    // Validation selon le type
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitized)) {
          errors.push('Format d\'email invalide');
        }
        break;

      case 'url':
        sanitized = this.sanitizeURL(sanitized);
        if (sanitized === '#') {
          errors.push('URL invalide ou dangereuse');
        }
        break;

      case 'number':
        if (isNaN(Number(sanitized))) {
          errors.push('Format numérique invalide');
        }
        break;

      case 'text':
      default:
        // Vérifier la longueur maximale
        if (sanitized.length > 10000) {
          errors.push('Texte trop long');
          sanitized = sanitized.substring(0, 10000);
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  /**
   * Créée un élément DOM sécurisé avec du contenu sanitisé
   */
  createSafeElement(tagName: string, content: string, attributes?: { [key: string]: string }): HTMLElement {
    const element = document.createElement(tagName);
    
    // Contenu sanitisé
    element.textContent = content;
    
    // Attributs sanitisés
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        const sanitizedKey = this.sanitizeText(key);
        const sanitizedValue = this.sanitizeText(value);
        
        // Vérifier que l'attribut est autorisé
        const allowedAttributes = ['class', 'id', 'title', 'alt', 'href', 'src'];
        if (allowedAttributes.includes(sanitizedKey)) {
          element.setAttribute(sanitizedKey, sanitizedValue);
        }
      }
    }

    return element;
  }

  /**
   * Alternative sécurisée à innerHTML
   */
  setInnerHTML(element: HTMLElement, html: string, options?: SanitizationOptions): void {
    const sanitizedHTML = this.sanitizeHTML(html, options);
    element.innerHTML = sanitizedHTML;
  }
}

// Export de l'instance singleton
export const sanitizer = EnhancedSanitizer.getInstance();

// Helpers pour usage simple
export const sanitizeHTML = (html: string, options?: SanitizationOptions) => 
  sanitizer.sanitizeHTML(html, options);

export const sanitizeText = (text: string) => 
  sanitizer.sanitizeText(text);

export const sanitizeURL = (url: string) => 
  sanitizer.sanitizeURL(url);

export const setInnerHTMLSafely = (element: HTMLElement, html: string, options?: SanitizationOptions) => 
  sanitizer.setInnerHTML(element, html, options);