import { useState, useEffect } from 'react';
import { EditorExtensionSDK } from '@contentful/app-sdk';
import { Field, FieldWrapper } from "@contentful/default-field-editors";
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';

// Prop types for DefaultField component
interface DefaultFieldProps {
  fieldId: string;
  sdk: any;
  widgetId: string | null;
}

// Converts a field into <FieldAPI> data type, which is the expected data type for many API methods
const getFieldAPI = (fieldId: string, sdk: EditorExtensionSDK) =>
  sdk.entry.fields[fieldId].getForLocale(sdk.locales.default);

// Creates a <FieldExtensionSDK> type that can be passed to components from the default-field-editors package
const getFieldExtensionSdk = (fieldId: string, sdk: EditorExtensionSDK) =>
  Object.assign({ field: getFieldAPI(fieldId, sdk) }, sdk);

// Render default contentful fields using Forma 36 Component
const DefaultField = (props: DefaultFieldProps) => {
  const { fieldId, sdk, widgetId } = props;

  return (
    <FieldWrapper sdk={sdk} name={fieldId} showFocusBar={true}>
      <Field sdk={sdk} widgetId={widgetId!} />
    </FieldWrapper>
  );
};

const Entry = () => {
  const sdk = useSDK<EditorExtensionSDK>();
  const locale = sdk.locales.default;
  const { fields } = sdk.contentType;

  console.log('!!! sdk', sdk);

  // Initial state values
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    console.log('??? isPrimary', isPrimary);
  });

  const fieldComponents = fields.map((field) => {
    const control = sdk.editor.editorInterface.controls!.find(
      (control) => control.fieldId === field.id
    );
    const widgetId = control?.widgetId || null;

    // If this field is a the conditional toggle, add a listener to the value
    if (field.name === 'isPrimary') {
      const elementsToToggle = ['image', 'icon', 'bodyText'];
      const partialFieldId = `entity.${field.id}.${locale}.${field.required}.`;
      const isPrimaryEl = (
        document.querySelector(`input[id^="${partialFieldId}"]`) as HTMLInputElement
      );
      console.log('!!! partialFieldId', partialFieldId);
      console.log('!!! inputEl', isPrimaryEl);
      // set default state value
      // setIsPrimary(isPrimaryValue === 'true')
      // const currentValue = document.querySelector(`#${fieldId}`)?.value;
    }

    return (
      <DefaultField
          key={field.id}
          fieldId={field.id}
          sdk={getFieldExtensionSdk(field.id, sdk)}
          widgetId={widgetId}
        />
    );
  })

  return (
    <div className="c-cf-wrapper">
      {fieldComponents}
    </div>
  );
};

export default Entry;
