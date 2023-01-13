import { ApolloError } from "@apollo/client/errors";
import { Button } from "@trinitypro/trinity-ui";
import React, { useContext, useEffect, useState } from "react";
import DocumentTitle from "react-document-title";
import { useHistory, useLocation } from "react-router-dom";

import { useGetInvoicesListQuery } from "../../../__generated__/hooks.generated";
import {
  AcceptanceInvoiceStatusEnum,
  GetInvoicesListQueryVariables,
} from "../../../__generated__/typings.generated";
import { Gapped } from "../../../components/gapped";
import { PlusIcon } from "../../../components/icons/plus-icon";
import { Loader } from "../../../components/loader";
import { TrinityTitle, acceptanceErrors } from "../../../constants";
import { ErrorContext } from "../../../contexts/error-context";
import { useLocalStorage } from "../../../hooks/use-local-storage";
import { AcceptanceNewRoute } from "../../../routes";
import { LocalStorageKeys } from "../../../typings/client";
import {
  getCurrentTabByStatus,
  getStatusByCurrentTab,
  stringIsCurrentTab,
} from "../acceptance-helpers";
import {
  Container,
  FlexContainer,
  Header,
  Root,
  Tab,
  Tabs,
  Title,
} from "./acceptance-list-page.styles";
import { AcceptanceList } from "./list";

// import { Search } from "./search";

interface AcceptanceProps {
  shopId: number;
}

export enum CurrentTab {
  Drafts = "drafts",
  Completed = "completed",
}

export const AcceptanceListPage: React.FC<AcceptanceProps> = (props) => {
  const { shopId } = props;

  const { onError } = useContext(ErrorContext);
  const history = useHistory();
  const location = useLocation();

  const [get, set] = useLocalStorage<GetInvoicesListQueryVariables>(
    LocalStorageKeys.AcceptanceListRequest,
  );

  const defaultRequest = {
    shopId,
    limit: 10,
    offset: 0,
    status: AcceptanceInvoiceStatusEnum.Draft,
  };
  const storedRequest = get();
  const [request, setRequest] = useState<GetInvoicesListQueryVariables>(
    storedRequest || defaultRequest,
  );

  const [tab, setTab] = useState<CurrentTab>(getInitialTab);

  const { data, refetch } = useGetInvoicesListQuery({
    fetchPolicy: "network-only",
    variables: request,
    onCompleted: ({ AcceptanceInvoiceList: { total, offset } }) => {
      if (offset > total) setRequest(defaultRequest);
    },
    onError: handleError,
  });

  useEffect(() => {
    set(request);
    refetch(request);
  }, [request, refetch, set]);

  return (
    <DocumentTitle title={`Приёмка товара | ${TrinityTitle}`}>
      <Root>
        <Header>
          <Container>
            <Gapped gap={30} vertical>
              <FlexContainer>
                <Title>Приёмка товара</Title>
                <Button
                  use="primary"
                  size="medium"
                  icon={<PlusIcon />}
                  onClick={() => history.push(AcceptanceNewRoute.getHref())}
                >
                  Добавить накладную
                </Button>
              </FlexContainer>

              <Tabs>
                <Tab
                  active={tab === CurrentTab.Drafts}
                  onClick={() => handleTabClick(CurrentTab.Drafts)}
                >
                  Черновики
                </Tab>
                <Tab
                  active={tab === CurrentTab.Completed}
                  onClick={() => handleTabClick(CurrentTab.Completed)}
                >
                  Проведённые
                </Tab>
              </Tabs>
            </Gapped>
          </Container>
        </Header>

        <Container>
          <Loader active={!data} style={{ padding: "100px 0" }}>
            {data && (
              <Gapped gap={16} vertical>
                {/* {data.AcceptanceInvoiceList.items && data.AcceptanceInvoiceList.items.length > 0 && ( */}
                {/*  <Search onLoadMore={onLoadMore} /> */}
                {/* )} */}

                {data?.AcceptanceInvoiceList && (
                  <AcceptanceList
                    invoices={data.AcceptanceInvoiceList}
                    tab={tab}
                    onLoadMore={onLoadMore}
                  />
                )}
              </Gapped>
            )}
          </Loader>
        </Container>
      </Root>
    </DocumentTitle>
  );

  function onLoadMore(partialRequest: Partial<GetInvoicesListQueryVariables>) {
    const newRequest = { ...request, ...partialRequest };
    setRequest(newRequest);
  }

  function handleTabClick(selectedTab: CurrentTab) {
    setRequest({ ...defaultRequest, status: getStatusByCurrentTab(selectedTab) });
    clearUrlParam();
    setTab(selectedTab);
  }

  function handleError(error: ApolloError) {
    onError({ title: acceptanceErrors.getListError, content: error.message });
  }

  function getInitialTab() {
    const tabFromUrl = new URLSearchParams(location.search).get("tab");
    if (tabFromUrl && stringIsCurrentTab(tabFromUrl)) {
      return tabFromUrl;
    }
    return storedRequest?.status ? getCurrentTabByStatus(storedRequest.status) : CurrentTab.Drafts;
  }

  function clearUrlParam() {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.has("tab")) {
      urlParams.delete("tab");
      history.replace({
        search: urlParams.toString(),
      });
    }
  }
};
