/**
 * Section des informations de base du formulaire de procédure
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProcedureForm } from '../ProcedureFormProvider';

export function BasicInfoSection() {
  const { state, actions, utils } = useProcedureForm();
  const { formData, errors } = state;
  const { nomenclatureData } = utils;

  const handleChange = (field: string, value: string) => {
    actions.updateFormData({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de base</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nom de la procédure */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nom de la procédure <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: Demande d'autorisation de construction"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Description détaillée de la procédure..."
            rows={4}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Catégorie de procédure */}
        <div className="space-y-2">
          <Label htmlFor="procedureCategory">
            Catégorie de procédure <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.procedureCategory}
            onValueChange={(value) => handleChange('procedureCategory', value)}
          >
            <SelectTrigger className={errors.procedureCategory ? 'border-red-500' : ''}>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {nomenclatureData?.procedureCategories?.map((category: string) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.procedureCategory && (
            <p className="text-sm text-red-500">{errors.procedureCategory}</p>
          )}
        </div>

        {/* Secteur d'administration */}
        <div className="space-y-2">
          <Label htmlFor="sectorAdministration">
            Secteur d'administration
          </Label>
          <Select
            value={formData.sectorAdministration}
            onValueChange={(value) => handleChange('sectorAdministration', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un secteur" />
            </SelectTrigger>
            <SelectContent>
              {nomenclatureData?.administrativeSectors?.map((sector: string) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Catégorie cible */}
        <div className="space-y-2">
          <Label htmlFor="targetCategory">
            Catégorie cible
          </Label>
          <Select
            value={formData.targetCategory}
            onValueChange={(value) => handleChange('targetCategory', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie cible" />
            </SelectTrigger>
            <SelectContent>
              {nomenclatureData?.targetCategories?.map((category: string) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}