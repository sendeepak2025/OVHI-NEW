import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Menu,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  X
} from 'lucide-react';
import { useTouch } from '@/hooks/useTouch';

interface MobileOptimizedInputProps {
  title: string;
  fields: Array<{
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
    value: any;
    options?: string[];
    placeholder?: string;
    required?: boolean;
  }>;
  onFieldChange: (fieldId: string, value: any) => void;
  onSubmit?: () => void;
  isOneHanded?: boolean;
}

interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'long-press';
  direction?: 'up' | 'down' | 'left' | 'right';
  target?: string;
}

export const MobileOptimizedInput: React.FC<MobileOptimizedInputProps> = ({
  title,
  fields,
  onFieldChange,
  onSubmit,
  isOneHanded = false
}) => {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [gestureMode, setGestureMode] = useState(false);
  const [showFloatingActions, setShowFloatingActions] = useState(true);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Array<HTMLElement | null>>([]);

  // Custom touch hook for gesture recognition
  const { onTouchStart, onTouchMove, onTouchEnd } = useTouch({
    onSwipe: handleSwipe,
    onPinch: handlePinch,
    onLongPress: handleLongPress
  });

  function handleSwipe(gesture: TouchGesture) {
    if (!gestureMode) return;
    
    switch (gesture.direction) {
      case 'up':
        navigateField('previous');
        break;
      case 'down':
        navigateField('next');
        break;
      case 'left':
        // Quick action - clear field
        onFieldChange(fields[currentFieldIndex].id, '');
        break;
      case 'right':
        // Quick action - auto-fill
        autoFillCurrentField();
        break;
    }
  }

  function handlePinch(scale: number) {
    if (scale > 1.1) {
      increaseFontSize();
    } else if (scale < 0.9) {
      decreaseFontSize();
    }
  }

  function handleLongPress() {
    setGestureMode(!gestureMode);
  }

  const navigateField = (direction: 'next' | 'previous') => {
    const newIndex = direction === 'next' 
      ? Math.min(currentFieldIndex + 1, fields.length - 1)
      : Math.max(currentFieldIndex - 1, 0);
    
    setCurrentFieldIndex(newIndex);
    
    // Scroll to field
    fieldRefs.current[newIndex]?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const autoFillCurrentField = () => {
    const field = fields[currentFieldIndex];
    if (!field) return;

    // Auto-fill logic based on field type and context
    let autoValue = '';
    
    switch (field.id) {
      case 'bloodPressure':
        autoValue = '120/80';
        break;
      case 'heartRate':
        autoValue = '72';
        break;
      case 'temperature':
        autoValue = '98.6';
        break;
      case 'subjective':
        autoValue = 'Patient denies any acute complaints';
        break;
      case 'objective':
        autoValue = 'Vital signs stable, physical examination unremarkable';
        break;
      default:
        if (field.options && field.options.length > 0) {
          autoValue = field.options[0];
        }
    }
    
    if (autoValue) {
      onFieldChange(field.id, autoValue);
    }
  };

  const resetToDefaults = () => {
    setFontSize(16);
    setCurrentFieldIndex(0);
    setIsExpanded(false);
  };

  const renderMobileField = (field: any, index: number) => {
    const isActive = index === currentFieldIndex;
    const isTouchSize = fontSize >= 18;
    
    return (
      <div
        key={field.id}
        ref={el => fieldRefs.current[index] = el}
        className={`
          mb-4 p-3 rounded-lg border-2 transition-all duration-200
          ${isActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${isTouchSize ? 'min-h-[60px]' : 'min-h-[50px]'}
        `}
        onClick={() => setCurrentFieldIndex(index)}
      >
        <label 
          className={`block font-medium mb-2 ${isTouchSize ? 'text-lg' : 'text-sm'}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </label>
        
        {field.type === 'textarea' ? (
          <Textarea
            value={field.value || ''}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`
              w-full resize-none
              ${isTouchSize ? 'min-h-[80px] text-lg p-4' : 'min-h-[60px]'}
            `}
            style={{ fontSize: `${fontSize}px` }}
          />
        ) : field.type === 'select' ? (
          <div className="space-y-2">
            {field.options?.map((option: string) => (
              <Button
                key={option}
                variant={field.value === option ? 'default' : 'outline'}
                onClick={() => onFieldChange(field.id, option)}
                className={`
                  w-full justify-start
                  ${isTouchSize ? 'h-12 text-lg' : 'h-10'}
                `}
                style={{ fontSize: `${fontSize}px` }}
              >
                {option}
              </Button>
            ))}
          </div>
        ) : field.type === 'checkbox' ? (
          <Button
            variant={field.value ? 'default' : 'outline'}
            onClick={() => onFieldChange(field.id, !field.value)}
            className={`
              w-full justify-start
              ${isTouchSize ? 'h-12 text-lg' : 'h-10'}
            `}
            style={{ fontSize: `${fontSize}px` }}
          >
            <CheckSquare className={`mr-2 h-5 w-5 ${field.value ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            {field.value ? 'Checked' : 'Unchecked'}
          </Button>
        ) : (
          <Input
            type={field.type}
            value={field.value || ''}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`
              w-full
              ${isTouchSize ? 'h-12 text-lg px-4' : 'h-10'}
            `}
            style={{ fontSize: `${fontSize}px` }}
          />
        )}
        
        {isActive && gestureMode && (
          <div className="mt-2 flex gap-2">
            <Badge variant="outline" className="text-xs">
              ← Clear
            </Badge>
            <Badge variant="outline" className="text-xs">
              → Auto-fill
            </Badge>
            <Badge variant="outline" className="text-xs">
              ↕ Navigate
            </Badge>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <Card 
        ref={cardRef}
        className={`
          ${isOneHanded ? 'max-w-sm mx-auto' : 'w-full'}
          ${gestureMode ? 'border-blue-500 shadow-lg' : ''}
        `}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGestureMode(!gestureMode)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={gestureMode ? 'default' : 'outline'}>
              Gestures {gestureMode ? 'ON' : 'OFF'}
            </Badge>
            <Badge variant="outline">
              Field {currentFieldIndex + 1}/{fields.length}
            </Badge>
            <Badge variant="outline">
              Font: {fontSize}px
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isExpanded ? (
            // Show all fields
            fields.map((field, index) => renderMobileField(field, index))
          ) : (
            // Show only current field
            <div>
              {renderMobileField(fields[currentFieldIndex], currentFieldIndex)}
              
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => navigateField('previous')}
                  disabled={currentFieldIndex === 0}
                  className="flex-1 mr-2"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigateField('next')}
                  disabled={currentFieldIndex === fields.length - 1}
                  className="flex-1 ml-2"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {onSubmit && (
            <Button
              onClick={onSubmit}
              className={`
                w-full mt-6
                ${fontSize >= 18 ? 'h-12 text-lg' : 'h-10'}
              `}
              style={{ fontSize: `${fontSize}px` }}
            >
              Submit
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Buttons */}
      {showFloatingActions && (
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          <Button
            size="sm"
            variant="outline"
            onClick={increaseFontSize}
            className="rounded-full w-10 h-10 p-0 shadow-lg"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={decreaseFontSize}
            className="rounded-full w-10 h-10 p-0 shadow-lg"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetToDefaults}
            className="rounded-full w-10 h-10 p-0 shadow-lg"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFloatingActions(false)}
            className="rounded-full w-10 h-10 p-0 shadow-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};