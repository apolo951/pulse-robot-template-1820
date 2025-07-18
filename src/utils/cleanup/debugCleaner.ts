/**
 * Utilitaire de nettoyage des instructions de debug
 * Supprime les console.log, console.warn, console.debug non critiques
 */

import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import path from 'path';

interface CleanupStats {
  filesProcessed: number;
  linesRemoved: number;
  consoleLogsRemoved: number;
  consoleWarnsRemoved: number;
  consoleDebugsRemoved: number;
}

export class DebugCleaner {
  private stats: CleanupStats = {
    filesProcessed: 0,
    linesRemoved: 0,
    consoleLogsRemoved: 0,
    consoleWarnsRemoved: 0,
    consoleDebugsRemoved: 0
  };

  /**
   * Nettoie les instructions de debug dans un fichier
   */
  private async cleanFile(filePath: string): Promise<boolean> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const cleanedLines: string[] = [];
      let hasChanges = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Garder les console.error (erreurs critiques)
        if (trimmed.includes('console.error')) {
          cleanedLines.push(line);
          continue;
        }

        // Supprimer les console.log simples
        if (this.isSimpleConsoleLog(trimmed)) {
          this.stats.consoleLogsRemoved++;
          this.stats.linesRemoved++;
          hasChanges = true;
          continue;
        }

        // Supprimer les console.warn simples
        if (this.isSimpleConsoleWarn(trimmed)) {
          this.stats.consoleWarnsRemoved++;
          this.stats.linesRemoved++;
          hasChanges = true;
          continue;
        }

        // Supprimer les console.debug
        if (this.isConsoleDebug(trimmed)) {
          this.stats.consoleDebugsRemoved++;
          this.stats.linesRemoved++;
          hasChanges = true;
          continue;
        }

        // Supprimer les commentaires DEBUG
        if (this.isDebugComment(trimmed)) {
          this.stats.linesRemoved++;
          hasChanges = true;
          continue;
        }

        cleanedLines.push(line);
      }

      if (hasChanges) {
        await writeFile(filePath, cleanedLines.join('\n'), 'utf-8');
        this.stats.filesProcessed++;
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Vérifie si la ligne est un console.log simple à supprimer
   */
  private isSimpleConsoleLog(line: string): boolean {
    const patterns = [
      /^console\.log\s*\([^)]*\)\s*;?\s*$/,
      /^\/\/\s*console\.log/,
      /console\.log\s*\(\s*['"`][^'"`]*['"`]\s*\)\s*;?\s*$/,
      /console\.log\s*\(\s*['"`][^'"`]*['"`]\s*,.*\)\s*;?\s*$/
    ];

    return patterns.some(pattern => pattern.test(line)) && 
           !line.includes('error') && 
           !line.includes('critical') &&
           !line.includes('security');
  }

  /**
   * Vérifie si la ligne est un console.warn simple à supprimer
   */
  private isSimpleConsoleWarn(line: string): boolean {
    const patterns = [
      /^console\.warn\s*\([^)]*\)\s*;?\s*$/,
      /^\/\/\s*console\.warn/
    ];

    return patterns.some(pattern => pattern.test(line)) && 
           !line.includes('critical') &&
           !line.includes('security');
  }

  /**
   * Vérifie si la ligne est un console.debug
   */
  private isConsoleDebug(line: string): boolean {
    return /console\.debug\s*\(/.test(line);
  }

  /**
   * Vérifie si la ligne est un commentaire de debug
   */
  private isDebugComment(line: string): boolean {
    const debugPatterns = [
      /^\/\/\s*DEBUG/i,
      /^\/\/\s*TODO.*debug/i,
      /^\/\/\s*=== DEBUG/i,
      /^console\.log\s*\(\s*['"`]=== DEBUG/
    ];

    return debugPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Nettoie tous les fichiers TypeScript/React
   */
  async cleanProject(srcPath: string = 'src'): Promise<CleanupStats> {
    try {
      // Rechercher tous les fichiers .ts et .tsx
      const files = await glob(`${srcPath}/**/*.{ts,tsx}`, {
        ignore: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/*.d.ts'
        ]
      });

      console.log(`Found ${files.length} files to process...`);

      // Traiter chaque fichier
      for (const file of files) {
        await this.cleanFile(file);
      }

      return this.stats;
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }

  /**
   * Affiche un rapport de nettoyage
   */
  printStats(): void {
    console.log('\n🧹 Debug Cleanup Report:');
    console.log(`  Files processed: ${this.stats.filesProcessed}`);
    console.log(`  Lines removed: ${this.stats.linesRemoved}`);
    console.log(`  console.log removed: ${this.stats.consoleLogsRemoved}`);
    console.log(`  console.warn removed: ${this.stats.consoleWarnsRemoved}`);
    console.log(`  console.debug removed: ${this.stats.consoleDebugsRemoved}`);
  }
}

// Usage CLI si le script est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleaner = new DebugCleaner();
  cleaner.cleanProject()
    .then(stats => {
      cleaner.printStats();
      process.exit(0);
    })
    .catch(error => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}