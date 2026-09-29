import React from 'react';
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
import { ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function DefaultFormLayout({ sections, layout = 'horizontal' }: DefaultFormLayoutProps) {
  return (
    <div className="flex flex-col gap-10 px-2 py-6 md:px-0">
      {sections.map((section, index) => {
        const sectionLayout = section.layout || layout;
        return (
          <React.Fragment key={section.title}>
            <FieldSet className={cn('block w-full border-none p-0', sectionLayout === 'horizontal' ? 'grid grid-cols-1 gap-10 md:grid-cols-3' : 'flex flex-col gap-6')}>
              <ItemContent className="gap-1">
                <FieldLegend variant="label" className="m-0 p-0">
                  <ItemTitle className="text-lg">{section.title}</ItemTitle>
                </FieldLegend>
                {section.description && <ItemDescription className="line-clamp-none">{section.description}</ItemDescription>}
              </ItemContent>

              <div className={cn(sectionLayout === 'horizontal' && 'md:col-span-2')}>
                <FieldGroup className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                  {/* A chave vem do próprio campo (todo chamador passa `key` no elemento); o
                      índice é só fallback. Antes era `${section.title}-field` para todos, o que
                      dava chave duplicada e fazia o React avisar que podia omitir ou duplicar
                      campos numa seção com mais de um. */}
                  {section.fields.map((field, fieldIndex) => (
                    <div key={React.isValidElement(field) && field.key ? field.key : `${section.title}-field-${fieldIndex}`} className="col-span-full">
                      {field}
                    </div>
                  ))}
                </FieldGroup>
              </div>
            </FieldSet>
            {index < sections.length - 1 && <Separator className="my-2" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export interface FormSection {
  title: string;
  description?: string;
  fields: React.ReactNode[];
  layout?: 'horizontal' | 'vertical';
}

interface DefaultFormLayoutProps {
  sections: FormSection[];
  layout?: 'horizontal' | 'vertical';
}
