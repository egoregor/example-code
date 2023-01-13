import { ApolloError } from "@apollo/client/errors";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";

import { useGetTrinityProductsLazyQuery } from "../../../../__generated__/hooks.generated";
import {
  GetTrinityProductsQuery,
  GetTrinityProductsQueryVariables,
  TrinityOrderFragment,
  TrinityOrderProductFragment,
  TrinityProductsResponseFragment,
} from "../../../../__generated__/typings.generated";
import { trinityOrderErrors } from "../../../../constants";
import { ErrorContext } from "../../../../contexts/error-context";
import { TrinityOrderHeader } from "../trinity-order-header";
import { ColoredContainer, Content, Root } from "../trinity-order-page.styles";
import { TrinityOrderCheckout } from "./trinity-order-checkout";
import { TrinityOrderSearch } from "./trinity-order-search";

interface TrinityOrderDraftProps {
  trinityOrder: TrinityOrderFragment;
  alreadyAddedProductsIds: Set<string>;
  onChange: (newState: TrinityOrderFragment) => void;
  onRemove: () => Promise<void>;
  onSend: () => void;
  updating: boolean;
  removing: boolean;
  disabled: boolean;
}

export enum Step {
  Search,
  Checkout,
}

export const TrinityOrderDraft: React.FC<TrinityOrderDraftProps> = (props) => {
  const {
    trinityOrder,
    alreadyAddedProductsIds,
    onChange,
    onRemove,
    onSend,
    updating,
    removing,
    disabled,
  } = props;

  const { onError } = useContext(ErrorContext);

  const [request, setRequest] = useState<GetTrinityProductsQueryVariables>({
    limit: 20,
    offset: 0,
  });
  const [searchValue, setSearchValue] = useState("");
  const [products, setProducts] = useState<TrinityProductsResponseFragment>();
  const [step, setStep] = useState<Step>(
    trinityOrder.products.length > 0 ? Step.Checkout : Step.Search,
  );

  const timeout = useRef<number>();

  const handleRequestChange = useCallback(
    (newRequest: Partial<GetTrinityProductsQueryVariables>) => {
      setRequest((prevRequest) => ({ ...prevRequest, ...newRequest }));
    },
    [],
  );

  const [fetchProducts] = useGetTrinityProductsLazyQuery({
    onCompleted: handleGetTrinityProductsCompleted,
    onError: handleGetTrinityProductsError,
    variables: request,
  });

  useEffect(() => {
    fetchProducts({ variables: request });
  }, [fetchProducts, request]);

  return (
    <Root>
      <TrinityOrderHeader trinityOrder={trinityOrder} onRemove={onRemove} removing={removing} />

      <Content>
        <ColoredContainer>
          {step === Step.Search && (
            <TrinityOrderSearch
              value={searchValue}
              onSearch={handleSearch}
              products={products}
              trinityOrder={trinityOrder}
              alreadyAddedProductsIds={alreadyAddedProductsIds}
              onProductAdd={handleProductAdd}
              onProductChange={handleProductChange}
              onProductRemove={handleProductRemove}
              onStepChange={handleStepChange}
              onLoadMore={handleRequestChange}
            />
          )}

          {step === Step.Checkout && (
            <TrinityOrderCheckout
              trinityOrder={trinityOrder}
              onProductChange={handleProductChange}
              onProductRemove={handleProductRemove}
              onSend={onSend}
              onStepChange={handleStepChange}
              updating={updating}
              removing={removing}
              disabled={disabled}
            />
          )}
        </ColoredContainer>
      </Content>
    </Root>
  );

  function handleProductAdd(product: TrinityOrderProductFragment) {
    const newState = { ...trinityOrder, products: [...trinityOrder.products, product] };
    onChange(newState);
  }

  function handleProductChange(uuid: string, partialProduct: Partial<TrinityOrderProductFragment>) {
    const newState = {
      ...trinityOrder,
      products: trinityOrder.products.map((product) => {
        if (product.product.uuid === uuid) {
          return { ...product, ...partialProduct };
        }
        return product;
      }),
    };
    onChange(newState);
  }

  function handleProductRemove(uuid: string) {
    const newProducts = trinityOrder.products.filter((product) => product.product.uuid !== uuid);
    const newState = { ...trinityOrder, products: newProducts };
    onChange(newState);
  }

  function handleSearch(value: string) {
    setSearchValue(value);
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(
      () => handleRequestChange({ productNameOrBarcode: value, offset: 0 }),
      500,
    );
  }

  function handleGetTrinityProductsCompleted(data: GetTrinityProductsQuery) {
    setProducts(data.TrinityProducts);
  }

  function handleGetTrinityProductsError(error: ApolloError) {
    onError({ title: trinityOrderErrors.getTrinityProductsError, content: error.message });
  }

  function handleStepChange(step: Step) {
    setStep(step);
  }
};
