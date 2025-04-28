
import React from 'react';
import { Recipe } from '../types';
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RecipeDisplayProps {
  recipe: Recipe;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe }) => {
  if (!recipe.title) {
    return null;
  }
  
  const getDoshaColor = (dosha: string) => {
    switch (dosha) {
      case 'vata': return 'bg-amber-700';
      case 'pitta': return 'bg-red-600';
      case 'kapha': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };
  
  const getEffectColor = (effect?: string) => {
    switch (effect) {
      case 'increases': return 'text-red-600';
      case 'decreases': return 'text-green-600';
      case 'balances': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="my-8 animate-fade-up">
      <div className="sanskrit-border inline-block mx-auto mb-6">
        <h2 className="text-3xl font-bold text-ayurveda-terra px-6 py-2">{recipe.title}</h2>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
        {/* Original Text */}
        <Card className="lg:w-1/3 bg-ayurveda-cream/30 p-6 border-ayurveda-wood/20">
          <h3 className="text-xl font-medium mb-3 text-ayurveda-spice">Original Sanskrit</h3>
          <div className="whitespace-pre-line font-serif text-lg leading-relaxed">
            {recipe.originalText}
          </div>
        </Card>
        
        <div className="lg:w-2/3 space-y-6">
          {/* Properties */}
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-ayurveda-leaf/30">
              <span className="text-sm text-gray-500">Primary Dosha</span>
              <div className="flex items-center mt-1">
                <span className={`h-3 w-3 rounded-full ${getDoshaColor(recipe.properties.primaryDosha)} mr-2`}></span>
                <span className="font-medium capitalize">{recipe.properties.primaryDosha}</span>
              </div>
            </div>
            
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-ayurveda-leaf/30">
              <span className="text-sm text-gray-500">Potency</span>
              <div className="flex items-center mt-1">
                <span className={`h-3 w-3 rounded-full ${recipe.properties.potency === 'hot' ? 'bg-orange-500' : 'bg-blue-400'} mr-2`}></span>
                <span className="font-medium capitalize">{recipe.properties.potency}</span>
              </div>
            </div>
            
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-ayurveda-leaf/30">
              <span className="text-sm text-gray-500">Tastes</span>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {recipe.properties.taste.map((taste, index) => (
                  <span key={index} className="text-xs px-2 py-0.5 bg-ayurveda-sage/20 rounded-full capitalize">
                    {taste}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-ayurveda-leaf/30">
              <span className="text-sm text-gray-500">Seasons</span>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {recipe.properties.season.map((season, index) => (
                  <span key={index} className="text-xs px-2 py-0.5 bg-ayurveda-saffron/20 rounded-full capitalize">
                    {season}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Ingredients */}
          <Card className="p-6">
            <h3 className="text-xl font-medium mb-4 text-ayurveda-terra">Ingredients</h3>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="herb-dot bg-ayurveda-sage mt-2"></span>
                  <div>
                    <span className="font-medium">{ingredient.name}</span>
                    <span className="text-muted-foreground ml-2">({ingredient.quantity})</span>
                    {ingredient.doshaEffect && (
                      <span className={`text-xs ml-2 ${getEffectColor(ingredient.doshaEffect)}`}>
                        {ingredient.doshaEffect} dosha
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          
          {/* Preparation */}
          <Card className="p-6">
            <h3 className="text-xl font-medium mb-4 text-ayurveda-terra">Preparation</h3>
            <ol className="space-y-3 list-decimal list-inside">
              {recipe.preparation.map((step, index) => (
                <li key={index} className="text-foreground">
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecipeDisplay;
