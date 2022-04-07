import React, { useState, useCallback } from "react";
import styled from "styled-components";
const DropdownContainer = styled.div`
  background: rgba(39, 18, 143, 0.39);
  width: 80%;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);

  border-radius: 30px;
  border: ${(props) => (props.isActive ? ` 2px solid #6d8487` : `none`)};
  border-top: none;

  text-align: center;
  &:hover {
    cursor: pointer;
  }
  margin-top: 15%;
`;

const DropdownBody = styled.div`
  display: flex;
  justify-content: center;
  padding: 9px 14px;
  border: 2px solid #6d8487;
  border-radius: 50px;
  color: white;
`;

const DropdownMenu = styled.ul`
  position: absolute;
  width: 100%;
  display: ${(props) => (props.isActive ? `block` : `none`)};
  height: 100px;
  overflow: scroll;
  text-align: center;
`;

const DropdownItemContainer = styled.li`
  color: white;
  padding: 9px 14px;
`;

const initial = ["나라", "과일", "가전제품", "옷"];
const Dropdown = ({ title }) => {
  const [isActive, setIsActive] = useState(false);
  const [item, setItem] = useState(null);

  const onActiveToggle = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  const onSelectItem = useCallback((e) => {
    setItem(e.target.innerHTML);

    setIsActive((prev) => !prev);
  }, []);

  return (
    <div>
      <DropdownContainer isActive={isActive}>
        <DropdownBody onClick={onActiveToggle}>
          {item ? <>{item}</> : <>{title}</>}
        </DropdownBody>

        <DropdownMenu isActive={isActive}>
          {initial.map((item, i) => (
            <DropdownItemContainer id="item" key={i} onClick={onSelectItem}>
              {item}{" "}
            </DropdownItemContainer>
          ))}
        </DropdownMenu>
      </DropdownContainer>
    </div>
  );
};

export default Dropdown;