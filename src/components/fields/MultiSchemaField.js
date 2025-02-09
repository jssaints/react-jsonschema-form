import React, { Component } from "react";
import PropTypes from "prop-types";
import * as types from "../../types";
import {
  getUiOptions,
  getWidget,
  guessType,
  retrieveSchema,
  getDefaultFormState,
  getMatchingOption,
} from "../../utils";

class AnyOfField extends Component {
  constructor(props) {
    super(props);

    const { formData, options } = this.props;

    this.state = {
      selectedOption: this.getMatchingOption(formData, options),
    };
  }

  componentWillReceiveProps(nextProps) {
    const matchingOption = this.getMatchingOption(
      nextProps.formData,
      nextProps.options
    );

    if (matchingOption === this.state.selectedOption) {
      return;
    }

    this.setState({ selectedOption: matchingOption });
  }

  getMatchingOption(formData, options) {
    const { definitions } = this.props.registry;

    let option = getMatchingOption(formData, options, definitions);
    if (option !== 0) {
      return option;
    }
    // If the form data matches none of the options, use the currently selected
    // option, assuming it's available; otherwise use the first option
    return this && this.state ? this.state.selectedOption : 0;
  }

  onOptionChange = option => {
    const selectedOption = parseInt(option, 10);
    const { formData, onChange, options, registry } = this.props;
    const { definitions } = registry;
    const newOption = retrieveSchema(
      options[selectedOption],
      definitions,
      formData
    );

    // If the new option is of type object and the current data is an object,
    // discard properties added using the old option.
    let newFormData = undefined;
    if (
      guessType(formData) === "object" &&
      (newOption.type === "object" || newOption.properties)
    ) {
      newFormData = Object.assign({}, formData);

      const optionsToDiscard = options.slice();
      optionsToDiscard.splice(selectedOption, 1);

      // Discard any data added using other options
      for (const option of optionsToDiscard) {
        if (option.properties) {
          for (const key in option.properties) {
            if (newFormData.hasOwnProperty(key)) {
              delete newFormData[key];
            }
          }
        }
      }
    }
    // Call getDefaultFormState to make sure defaults are populated on change.
    onChange(
      getDefaultFormState(options[selectedOption], newFormData, definitions)
    );

    this.setState({
      selectedOption: parseInt(option, 10),
    });
  };

  render() {
    const {
      baseType,
      disabled,
      errorSchema,
      formData,
      taskData,
      idPrefix,
      idSchema,
      onBlur,
      onChange,
      onFocus,
      options,
      registry,
      safeRenderCompletion,
      uiSchema,
      permission,
      updatedFields,
      updatedFieldClassName,
      isDataLoaded,
      AuthID,
      EditorType,
      TaskID,
      timezone,
      subForms,
      roleId,
    } = this.props;
    const _SchemaField = registry.fields.SchemaField;
    const { widgets } = registry;
    const { selectedOption } = this.state;
    const { widget = "select", ...uiOptions } = getUiOptions(uiSchema);
    const Widget = getWidget({ type: "number" }, widget, widgets);

    const option = options[selectedOption] || null;
    let optionSchema;

    if (option) {
      // If the subschema doesn't declare a type, infer the type from the
      // parent schema
      optionSchema = option.type
        ? option
        : Object.assign({}, option, { type: baseType });
    }

    const enumOptions = options.map((option, index) => ({
      label: option.title || `Option ${index + 1}`,
      value: index,
    }));

    return (
      <div className="panel panel-default panel-body">
        <div className="form-group">
          <Widget
            id={`${idSchema.$id}_anyof_select`}
            schema={{ type: "number", default: 0 }}
            onChange={this.onOptionChange}
            onBlur={onBlur}
            onFocus={onFocus}
            value={selectedOption}
            options={{ enumOptions }}
            {...uiOptions}
          />
        </div>

        {option !== null && (
          <_SchemaField
            schema={optionSchema}
            uiSchema={uiSchema}
            permission={permission}
            updatedFields={updatedFields}
            updatedFieldClassName={updatedFieldClassName}
            isDataLoaded={isDataLoaded}
            AuthID={AuthID}
            EditorType={EditorType}
            TaskID={TaskID}
            timezone={timezone}
            subForms={subForms}
            roleId={roleId}
            errorSchema={errorSchema}
            idSchema={idSchema}
            idPrefix={idPrefix}
            taskData={taskData}
            formData={formData}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            registry={registry}
            safeRenderCompletion={safeRenderCompletion}
            disabled={disabled}
          />
        )}
      </div>
    );
  }
}

AnyOfField.defaultProps = {
  disabled: false,
  errorSchema: {},
  idSchema: {},
  uiSchema: {},
};

if (process.env.NODE_ENV !== "production") {
  AnyOfField.propTypes = {
    options: PropTypes.arrayOf(PropTypes.object).isRequired,
    baseType: PropTypes.string,
    uiSchema: PropTypes.object,
    idSchema: PropTypes.object,
    formData: PropTypes.any,
    errorSchema: PropTypes.object,
    registry: types.registry.isRequired,
  };
}

export default AnyOfField;
