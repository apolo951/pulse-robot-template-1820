/**
 * Formulaire de procédure refactorisé et modulaire
 * Remplace le composant ProcedureForm.tsx monolithique
 */

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Scan } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProcedureFormProvider, useProcedureForm } from './ProcedureFormProvider';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { ModalitiesSection } from './sections/ModalitiesSection';
import { SmartOCRProcessor } from '@/components/common/SmartOCRProcessor';

interface ProcedureFormRefactoredProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  ocrData?: any;
  initialInputMethod?: 'manual' | 'ocr';
}

// Composant interne avec accès au contexte
function ProcedureFormContent() {
  const { state, actions } = useProcedureForm();
  const { inputMethod, showOCRScanner, isLoading } = state;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-white hover:bg-green-700"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                Nouvelle Procédure Administrative
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => actions.setShowOCRScanner(!showOCRScanner)}
                className="text-white hover:bg-green-700"
              >
                <Scan className="w-4 h-4 mr-2" />
                Scanner OCR
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => actions.submitForm()}
                disabled={isLoading}
                className="text-white hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {inputMethod === 'ocr' && showOCRScanner ? (
            <div className="p-6">
              <SmartOCRProcessor
                onFormDataExtracted={actions.handleOCRData}
                onClose={() => actions.setShowOCRScanner(false)}
                documentTypes={['procedure']}
              />
            </div>
          ) : (
            <div className="p-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="basic">Informations</TabsTrigger>
                  <TabsTrigger value="steps">Étapes</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="modalities">Modalités</TabsTrigger>
                  <TabsTrigger value="appeal">Recours</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                  <TabsContent value="basic" className="space-y-6">
                    <BasicInfoSection />
                  </TabsContent>

                  <TabsContent value="steps" className="space-y-6">
                    {/* TODO: Créer StepsSection */}
                    <div className="text-center py-8 text-gray-500">
                      Section des étapes en cours de développement
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-6">
                    {/* TODO: Créer DocumentsSection */}
                    <div className="text-center py-8 text-gray-500">
                      Section des documents en cours de développement
                    </div>
                  </TabsContent>

                  <TabsContent value="modalities" className="space-y-6">
                    <ModalitiesSection />
                  </TabsContent>

                  <TabsContent value="appeal" className="space-y-6">
                    {/* TODO: Créer AppealSection */}
                    <div className="text-center py-8 text-gray-500">
                      Section des recours en cours de développement
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-6">
                    {/* TODO: Créer ContactSection */}
                    <div className="text-center py-8 text-gray-500">
                      Section du contact en cours de développement
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={() => actions.submitForm()}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant principal avec Provider
export function ProcedureFormRefactored({
  onClose,
  onSubmit,
  ocrData,
  initialInputMethod = 'manual'
}: ProcedureFormRefactoredProps) {
  return (
    <ProcedureFormProvider
      onClose={onClose}
      onSubmit={onSubmit}
      ocrData={ocrData}
      initialInputMethod={initialInputMethod}
    >
      <ProcedureFormContent />
    </ProcedureFormProvider>
  );
}