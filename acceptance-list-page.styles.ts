import styled, { css } from "styled-components";

import { breakpoints } from "../../../app.styles";

export const Root = styled.div``;

export const Header = styled.div`
  padding: calc(${(props) => props.theme.headerHeight} + 26px) 0 0;
  margin-bottom: 16px;
  background: ${(props) => props.theme.colors.gray9};
`;

export const Container = styled.div`
  padding: 0 16px;
  max-width: ${(props) => props.theme.layoutMaxWidth};
  margin: 0 auto;
`;

export const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: ${breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const Title = styled.h4`
  padding: 0;
  margin: 0;

  @media (max-width: ${breakpoints.sm}) {
    margin-bottom: 20px;
  }
`;

export const Tabs = styled.div`
  display: inline-block;
  margin: 0px -20px;
  padding: 0;
  position: relative;
`;

export const Tab = styled.a<{ active: boolean }>`
  border-bottom: 3px solid transparent;
  color: ${(props) => props.theme.colors.gray6};
  cursor: pointer;
  display: inline-block;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  margin-left: 20px;
  margin-right: 20px;
  padding: 8px 8px 12px;
  position: relative;
  transition: all 0.2s ease-out 0s;

  &:hover {
    cursor: pointer;
    border-bottom-color: ${(props) => props.theme.colors.primary2};
  }

  ${(props) =>
    props.active &&
    css`
      color: ${(props) => props.theme.colors.primary2};
      border-bottom-color: ${(props) => props.theme.colors.primary2};

      &:hover {
        cursor: default;
      }
    `}
`;
