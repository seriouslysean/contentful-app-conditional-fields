// @ts-nocheck

import { useState, useEffect } from 'react';
import { EditorExtensionSDK } from '@contentful/app-sdk';
import { Field, FieldWrapper } from "@contentful/default-field-editors";
import { FormControl, Checkbox } from "@contentful/f36-components";
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';

// Converts a field into <FieldAPI> data type, which is the expected data type for many API methods
const getFieldAPI = (fieldId, sdk) =>
  sdk.entry.fields[fieldId].getForLocale(sdk.locales.default);

// Creates a <FieldExtensionSDK> type that can be passed to components from the default-field-editors package
const getFieldExtensionSdk = (fieldId, sdk) =>
  Object.assign({ field: getFieldAPI(fieldId, sdk) }, sdk);

// Render default contentful fields using Forma 36 Component
const DefaultField = (props) => {
  const { fieldId, sdk, widgetId } = props;

  return (
    <FieldWrapper sdk={sdk} name={fieldId} showFocusBar={true}>
      <Field sdk={sdk} widgetId={widgetId!} />
    </FieldWrapper>
  );
};

// A stateful Boolean component that mimics Contentful's default
const CustomBoolean = (props) => {
  const { field, handleChange, sdk, value } = props;
  return (
    <FieldWrapper sdk={sdk} name={field.name}>
      <FormControl isRequired>
        <Checkbox
          name={`${field.id}-controlled`}
          id={`${field.id}-controlled`}
          isChecked={value}
          onChange={(e) => handleChange(field.id, e.target.checked)}
        ></Checkbox>
      </FormControl>
    </FieldWrapper>
  );
};

const Entry = () => {
  const sdk = useSDK();
  const locale = sdk.locales.default;
  const { fields } = sdk.contentType;

  console.log('!!! sdk', sdk);

  // Store the input values of managed fields.
  // Managed fields are fields whose state needs to be managed by this app.
  const [managedFieldValues, setManagedFieldValues] = useState(
    fields
      .map((field) => field.id)
      .reduce((acc, field) => {
        const defaultValueObject = fields.find(
          (editorField) => editorField.id === field
        )?.defaultValue;
        const defaultValue = defaultValueObject
          ? defaultValueObject[locale]
          : '';
        return { ...acc, [field]: defaultValue };
      }, {})
  );

  // save input to Contentful
  const saveInput = (fieldId, input) => {
    getFieldAPI(fieldId, sdk)
      .setValue(input)
      .then((data) => {
        console.log(`saving data to contentful... ${fieldId}:  ${data}`);
      })
      .catch((err) => {
        console.log("something went wrong with saving data to contentful.");
        console.log(err);
      });
  };

  // Update state value for a managed field
  const updateInput = (fieldId, isChecked) => {
    setManagedFieldValues((prevState) => ({
      ...prevState,
      [fieldId]: isChecked,
    }));

    // Save data to contentful after 3 seconds
    setTimeout(() => {
      saveInput(fieldId, isChecked);
    }, 3000);
  };

  useEffect(() => {
    // ???
  }, [managedFieldValues, fields]);

  const fieldComponents = fields.map((field) => {
    const control = sdk.editor.editorInterface.controls!.find(
      (control) => control.fieldId === field.id
    );
    const widgetId = control?.widgetId || null;
    const defaultValue = field.defaultValue?.hasOwnProperty(locale) ?
      field.defaultValue[sdk.locales.default] : null;
    const fieldsToToggle = ['image', 'icon', 'bodyText'];

    if (field.id === 'isPrimary') {
      return (
        <div className="c-cf-field" key={field.id}>
          <CustomBoolean
            value={
              // TODO: How do we get the initial value? The default value isn't updated
              // to the set value from the initial contentful response and I don't see it in the
              // sdk object
              managedFieldValues[field.id] || defaultValue
            }
            field={field}
            handleChange={updateInput}
            sdk={getFieldExtensionSdk(field.id, sdk)} />
          </div>
      );
    }

    const getInlineStyle = (fieldId) => {
      return managedFieldValues['isPrimary'] === true && fieldsToToggle.includes(fieldId) ?
        { display: 'none' } : {};
    };
    return (
      <div className="c-cf-field" style={getInlineStyle(field.id)} key={field.id}>
        <DefaultField
          fieldId={field.id}
          sdk={getFieldExtensionSdk(field.id, sdk)}
          widgetId={widgetId}
        />
      </div>
    );
  })

  return (
    <div className="c-cf-wrapper">
      {fieldComponents}
    </div>
  );
};

export default Entry;
