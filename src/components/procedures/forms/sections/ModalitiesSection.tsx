/**
 * Section des modalités du formulaire de procédure
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useProcedureForm } from '../ProcedureFormProvider';

export function ModalitiesSection() {
  const { state, actions } = useProcedureForm();
  const { formData } = state;

  const handleChange = (field: string, value: any) => {
    actions.updateFormData({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modalités</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lieu de dépôt */}
        <div className="space-y-2">
          <Label htmlFor="submissionLocation">
            Lieu de dépôt
          </Label>
          <Textarea
            id="submissionLocation"
            value={formData.submissionLocation}
            onChange={(e) => handleChange('submissionLocation', e.target.value)}
            placeholder="Indiquer le lieu de dépôt de la demande..."
            rows={3}
          />
        </div>

        {/* Type de validité */}
        <div className="space-y-3">
          <Label>Type de validité</Label>
          <RadioGroup
            value={formData.validityType}
            onValueChange={(value) => handleChange('validityType', value)}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="periodic" id="periodic" />
              <Label htmlFor="periodic">Périodique</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="open" id="open" />
              <Label htmlFor="open">Ouverte</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Dates de validité */}
        {formData.validityType === 'periodic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validityStartDate">
                Date de début
              </Label>
              <Input
                id="validityStartDate"
                type="date"
                value={formData.validityStartDate}
                onChange={(e) => handleChange('validityStartDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validityEndDate">
                Date de fin
              </Label>
              <Input
                id="validityEndDate"
                type="date"
                value={formData.validityEndDate}
                onChange={(e) => handleChange('validityEndDate', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Durée de traitement */}
        <div className="space-y-2">
          <Label htmlFor="processingDuration">
            Durée de traitement
          </Label>
          <Input
            id="processingDuration"
            value={formData.processingDuration}
            onChange={(e) => handleChange('processingDuration', e.target.value)}
            placeholder="Ex: 30 jours ouvrables"
          />
        </div>

        {/* Frais */}
        <div className="space-y-4">
          <Label>Frais</Label>
          <RadioGroup
            value={formData.feeType}
            onValueChange={(value) => handleChange('feeType', value)}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gratuit" id="gratuit" />
              <Label htmlFor="gratuit">Gratuit</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="payant" id="payant" />
              <Label htmlFor="payant">Payant</Label>
            </div>
          </RadioGroup>

          {formData.feeType === 'payant' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feeAmount">
                  Montant
                </Label>
                <Input
                  id="feeAmount"
                  value={formData.feeAmount}
                  onChange={(e) => handleChange('feeAmount', e.target.value)}
                  placeholder="Ex: 50 DA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethods">
                  Modes de paiement
                </Label>
                <Textarea
                  id="paymentMethods"
                  value={formData.paymentMethods}
                  onChange={(e) => handleChange('paymentMethods', e.target.value)}
                  placeholder="Ex: Virement bancaire, chèque, espèces..."
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {/* Numérisation */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="digitization"
              checked={formData.digitization}
              onCheckedChange={(checked) => handleChange('digitization', checked)}
            />
            <Label htmlFor="digitization">
              Procédure numérisée
            </Label>
          </div>

          {formData.digitization && (
            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="digitizationDate">
                  Date de numérisation
                </Label>
                <Input
                  id="digitizationDate"
                  type="date"
                  value={formData.digitizationDate}
                  onChange={(e) => handleChange('digitizationDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="electronicPortalLink">
                  Lien du portail électronique
                </Label>
                <Input
                  id="electronicPortalLink"
                  type="url"
                  value={formData.electronicPortalLink}
                  onChange={(e) => handleChange('electronicPortalLink', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileAppLink">
                  Lien de l'application mobile
                </Label>
                <Input
                  id="mobileAppLink"
                  type="url"
                  value={formData.mobileAppLink}
                  onChange={(e) => handleChange('mobileAppLink', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="thirdPartySubmission"
                  checked={formData.thirdPartySubmission}
                  onCheckedChange={(checked) => handleChange('thirdPartySubmission', checked)}
                />
                <Label htmlFor="thirdPartySubmission">
                  Dépôt par un tiers autorisé
                </Label>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}