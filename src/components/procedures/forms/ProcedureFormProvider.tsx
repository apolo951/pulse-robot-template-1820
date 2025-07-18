/**
 * Provider pour le contexte du formulaire de procédure
 * Centralise la gestion de l'état et les actions
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNomenclatureData } from '@/hooks/useNomenclatureData';
import { useFormLibraryStore } from '@/stores/formLibraryStore';

// Types
export interface ProcedureFormData {
  // Informations de base
  name: string;
  description: string;
  procedureCategory: string;
  sectorAdministration: string;
  targetCategory: string;
  
  // Champs dynamiques
  steps: string[];
  conditions: string[];
  requiredDocuments: string[];
  requiredDocumentsType: 'existing' | 'text';
  complementaryDocuments: string[];
  complementaryDocumentsType: 'existing' | 'text';
  legalBasis: string[];
  
  // Modalités
  submissionLocation: string;
  validityType: 'periodic' | 'open';
  validityStartDate: string;
  validityEndDate: string;
  processingDuration: string;
  feeType: 'gratuit' | 'payant';
  feeAmount: string;
  paymentMethods: string;
  
  // Numérisation
  digitization: boolean;
  digitizationDate: string;
  electronicPortalLink: string;
  mobileAppLink: string;
  thirdPartySubmission: boolean;
  
  // Retrait et validité
  withdrawalTime: string;
  withdrawalMethod: string;
  documentValidity: string;
  
  // Recours
  hasAppeal: boolean;
  appealLocation: string;
  appealDeadline: string;
  appealFees: string;
  
  // Fichiers
  userGuide: string;
  downloadableForm: string;
  
  // FAQ et contact
  faq: string;
  contactAddress: string;
  contactPhone: string;
  contactGreenNumber: string;
  contactEmail: string;
}

export type InputMethodType = 'manual' | 'ocr';

interface ProcedureFormState {
  formData: ProcedureFormData;
  inputMethod: InputMethodType;
  showOCRScanner: boolean;
  selectedForm: any;
  customFields: any[];
  isLoading: boolean;
  errors: Record<string, string>;
}

type ProcedureFormAction =
  | { type: 'SET_FORM_DATA'; payload: Partial<ProcedureFormData> }
  | { type: 'SET_INPUT_METHOD'; payload: InputMethodType }
  | { type: 'SET_SHOW_OCR_SCANNER'; payload: boolean }
  | { type: 'SET_SELECTED_FORM'; payload: any }
  | { type: 'SET_CUSTOM_FIELDS'; payload: any[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'RESET_FORM' };

// État initial
const initialState: ProcedureFormState = {
  formData: {
    name: '',
    description: '',
    procedureCategory: '',
    sectorAdministration: '',
    targetCategory: '',
    steps: [''],
    conditions: [''],
    requiredDocuments: [''],
    requiredDocumentsType: 'text',
    complementaryDocuments: [''],
    complementaryDocumentsType: 'text',
    legalBasis: [''],
    submissionLocation: '',
    validityType: 'periodic',
    validityStartDate: '',
    validityEndDate: '',
    processingDuration: '',
    feeType: 'gratuit',
    feeAmount: '',
    paymentMethods: '',
    digitization: false,
    digitizationDate: '',
    electronicPortalLink: '',
    mobileAppLink: '',
    thirdPartySubmission: false,
    withdrawalTime: '',
    withdrawalMethod: '',
    documentValidity: '',
    hasAppeal: false,
    appealLocation: '',
    appealDeadline: '',
    appealFees: '',
    userGuide: '',
    downloadableForm: '',
    faq: '',
    contactAddress: '',
    contactPhone: '',
    contactGreenNumber: '',
    contactEmail: ''
  },
  inputMethod: 'manual',
  showOCRScanner: false,
  selectedForm: null,
  customFields: [],
  isLoading: false,
  errors: {}
};

// Reducer
function procedureFormReducer(state: ProcedureFormState, action: ProcedureFormAction): ProcedureFormState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload }
      };
    case 'SET_INPUT_METHOD':
      return { ...state, inputMethod: action.payload };
    case 'SET_SHOW_OCR_SCANNER':
      return { ...state, showOCRScanner: action.payload };
    case 'SET_SELECTED_FORM':
      return { ...state, selectedForm: action.payload };
    case 'SET_CUSTOM_FIELDS':
      return { ...state, customFields: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'RESET_FORM':
      return { ...initialState };
    default:
      return state;
  }
}

// Context
interface ProcedureFormContextType {
  state: ProcedureFormState;
  actions: {
    updateFormData: (data: Partial<ProcedureFormData>) => void;
    setInputMethod: (method: InputMethodType) => void;
    setShowOCRScanner: (show: boolean) => void;
    setSelectedForm: (form: any) => void;
    setCustomFields: (fields: any[]) => void;
    setLoading: (loading: boolean) => void;
    setErrors: (errors: Record<string, string>) => void;
    resetForm: () => void;
    handleOCRData: (data: any) => void;
    validateForm: () => boolean;
    submitForm: () => Promise<void>;
  };
  utils: {
    nomenclatureData: any;
    procedureForms: any[];
    toast: any;
  };
}

const ProcedureFormContext = createContext<ProcedureFormContextType | undefined>(undefined);

// Provider
export function ProcedureFormProvider({ 
  children, 
  onSubmit,
  onClose,
  ocrData,
  initialInputMethod = 'manual'
}: {
  children: ReactNode;
  onSubmit: (data: any) => void;
  onClose: () => void;
  ocrData?: any;
  initialInputMethod?: InputMethodType;
}) {
  const [state, dispatch] = useReducer(procedureFormReducer, {
    ...initialState,
    inputMethod: initialInputMethod
  });

  const { toast } = useToast();
  const { nomenclatureData, mapOCRDataToForm } = useNomenclatureData();
  const { forms: customForms } = useFormLibraryStore();

  // Filtrer les formulaires de procédures
  const PROCEDURE_TYPES = [
    'Procédure Administrative', 'Procédure', 'Procedure Administrative'
  ];
  
  const PROCEDURE_CATEGORIES = [
    'Procédures Administratives', 'Urbanisme', 'État civil', 'Social', 'Fiscal', 
    'Commerce', 'Environnement', 'Santé', 'Éducation', 'Transport', 'Agriculture',
    'Fiscalité', 'Fonction Publique', 'État Civil', 'Emploi'
  ];
  
  const procedureForms = customForms.filter(form => 
    PROCEDURE_TYPES.includes(form.type) || 
    PROCEDURE_CATEGORIES.includes(form.category) ||
    form.type === 'procedures_administratives' || 
    form.category === 'Procédures Administratives'
  );

  // Actions
  const actions = {
    updateFormData: (data: Partial<ProcedureFormData>) => {
      dispatch({ type: 'SET_FORM_DATA', payload: data });
    },

    setInputMethod: (method: InputMethodType) => {
      dispatch({ type: 'SET_INPUT_METHOD', payload: method });
    },

    setShowOCRScanner: (show: boolean) => {
      dispatch({ type: 'SET_SHOW_OCR_SCANNER', payload: show });
    },

    setSelectedForm: (form: any) => {
      dispatch({ type: 'SET_SELECTED_FORM', payload: form });
    },

    setCustomFields: (fields: any[]) => {
      dispatch({ type: 'SET_CUSTOM_FIELDS', payload: fields });
    },

    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },

    setErrors: (errors: Record<string, string>) => {
      dispatch({ type: 'SET_ERRORS', payload: errors });
    },

    resetForm: () => {
      dispatch({ type: 'RESET_FORM' });
    },

    handleOCRData: (data: any) => {
      if (data.documentType !== 'procedure') {
        toast({
          title: "Type de document incompatible",
          description: "Ce document n'est pas une procédure administrative",
          variant: "destructive"
        });
        return;
      }

      const mappedData = mapOCRDataToForm(data.formData, 'procedure');
      actions.updateFormData(mappedData);
      actions.setInputMethod('manual');
      
      toast({
        title: "Données OCR traitées",
        description: "Les informations ont été extraites et remplies automatiquement",
        variant: "default"
      });
    },

    validateForm: (): boolean => {
      const errors: Record<string, string> = {};
      
      if (!state.formData.name.trim()) {
        errors.name = 'Le nom de la procédure est obligatoire';
      }
      
      if (!state.formData.description.trim()) {
        errors.description = 'La description est obligatoire';
      }
      
      if (!state.formData.procedureCategory) {
        errors.procedureCategory = 'La catégorie de procédure est obligatoire';
      }

      dispatch({ type: 'SET_ERRORS', payload: errors });
      return Object.keys(errors).length === 0;
    },

    submitForm: async (): Promise<void> => {
      if (!actions.validateForm()) {
        toast({
          title: "Erreurs dans le formulaire",
          description: "Veuillez corriger les erreurs avant de soumettre",
          variant: "destructive"
        });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        await onSubmit(state.formData);
        
        toast({
          title: "Procédure enregistrée",
          description: "La procédure a été enregistrée avec succès",
          variant: "default"
        });
        
        onClose();
      } catch (error) {
        toast({
          title: "Erreur lors de l'enregistrement",
          description: "Une erreur est survenue lors de l'enregistrement",
          variant: "destructive"
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  const contextValue: ProcedureFormContextType = {
    state,
    actions,
    utils: {
      nomenclatureData,
      procedureForms,
      toast
    }
  };

  return (
    <ProcedureFormContext.Provider value={contextValue}>
      {children}
    </ProcedureFormContext.Provider>
  );
}

// Hook pour utiliser le contexte
export function useProcedureForm() {
  const context = useContext(ProcedureFormContext);
  if (!context) {
    throw new Error('useProcedureForm must be used within ProcedureFormProvider');
  }
  return context;
}