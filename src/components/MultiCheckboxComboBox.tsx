import React, { useState } from "react";
import { Dropdown, Form } from "react-bootstrap";

import "./MultiCheckboxComboBox.scss";

interface IItemsProps {
  [key: string]: string | object;
}

interface IMultiCheckboxComboBoxProps {
  values?: any[];
  itemLabelKey: string;
  items?: IItemsProps;
  placeholder?: string;
  disabled?: boolean;
  onSelectChange?: (newSelectValue?: any[]) => void;
}

interface IOnSelectChangeProps {
  newItem: string | object;
  isString: boolean;
}

const defaultProps = {
  values: [],
  items: [],
  placeholder: "",
  disabled: false,
  onSelectChange: () => null
};

const MultiCheckboxComboBox = (
  props: IMultiCheckboxComboBoxProps & typeof defaultProps
) => {
  const {
    values,
    itemLabelKey,
    items,
    placeholder,
    disabled,
    onSelectChange
  } = props;
  const [showSelectContainer, setShowSelectContainer] = useState(false);
  const selectButtonClassName = showSelectContainer
    ? "selectButton"
    : "selectButton selectButton--hide";

  const handleSelectChange = (handleChangeProps: IOnSelectChangeProps) => {
    const { newItem, isString } = handleChangeProps;
    let newSelectValues = [];
    if (isString) {
      if (values.find((value) => value === newItem)) {
        newSelectValues = values.filter((value) => value !== newItem);
      } else {
        newSelectValues = items.filter(
          (item) => values.find((value) => value === item) || item === newItem
        );
      }
    } else if (values.find((value) => value[itemLabelKey] === newItem)) {
      newSelectValues = values.filter(
        (value) => value[itemLabelKey] !== newItem
      );
    } else {
      newSelectValues = items.filter(
        (item) =>
          values.find((value) => value[itemLabelKey] === item[itemLabelKey]) ||
          newItem === item[itemLabelKey]
      );
    }

    onSelectChange(newSelectValues);
  };

  const handleMenuToggle = (isOpen: boolean) => {
    if (showSelectContainer !== isOpen) {
      setShowSelectContainer(isOpen);
    }
  };

  return (
    <div className="multiCheckboxComboBox">
      <button
        className={selectButtonClassName}
        type="button"
        disabled={disabled}
        onClick={() => {
          setShowSelectContainer(!showSelectContainer);
        }}
      >
        {values.length ? (
          <span className="value value--itemContainer">
            {values.map((value) => {
              const showString =
                typeof value === "string" ? value : value[itemLabelKey];
              return (
                <span key={showString} className="value value--item">
                  {showString}
                </span>
              );
            })}
          </span>
        ) : (
          <span className="value value--placeholder">{placeholder}</span>
        )}
      </button>
      <Dropdown
        align="end"
        show={showSelectContainer}
        onToggle={handleMenuToggle}
      >
        <Dropdown.Menu className="comboBoxMenu">
          {items.map((item) => {
            const isString = typeof item === "string";
            const newItem = isString ? item : item[itemLabelKey];
            const checked = !!values.find((value) => {
              if (isString) {
                return value === item;
              }

              return value[itemLabelKey] === item[itemLabelKey];
            });

            return (
              <Dropdown.Item
                eventKey="selectItem"
                key={newItem}
                onClick={() => {
                  handleSelectChange({ newItem, isString });
                }}
              >
                <Form.Check
                  value={newItem}
                  id={newItem}
                  label={newItem}
                  checked={checked}
                  readOnly
                />
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

MultiCheckboxComboBox.defaultProps = defaultProps;

export default MultiCheckboxComboBox;
