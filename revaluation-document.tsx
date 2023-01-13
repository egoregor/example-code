import { ApolloError } from "@apollo/client/errors";
import React, { useContext, useEffect, useRef, useState } from "react";
import DocumentTitle from "react-document-title";
import { FieldErrors } from "react-hook-form/dist/types/errors";
import { useHistory, useParams } from "react-router-dom";

import {
  useGetRevaluationQuery,
  useUpdateRevaluationMutation,
} from "../../../__generated__/hooks.generated";
import {
  GetRevaluationQuery,
  RevaluationStatus,
  UpdateInvoiceMutationVariables,
  UpdateRevaluationMutationVariables,
} from "../../../__generated__/typings.generated";
import { Loader } from "../../../components/loader";
import { TrinityTitle, revaluationErrors } from "../../../constants";
import { ErrorContext } from "../../../contexts/error-context";
import { validate } from "../../../lib/validation";
import { RevaluationListRoute } from "../../../routes";
import { RevaluationDocumentParams } from "../../../routes/revaluation/revaluation-document-route";
import { DraftStatus } from "../../../typings/client";
import { updateRevaluationStatus } from "../revaluation-helpers";
import { RevaluationDocumentContent } from "./revaluation-document-content";
import { RevaluationDocumentControls } from "./revaluation-document-controls";
import { RevaluationDocumentHeader } from "./revaluation-document-header";
import { ColoredContainer, Content, Root } from "./revaluation-document.styles";
import { schema } from "./validation";

interface RevaluationDocumentProps {
  shopId: number;
  firmId: number;
}

export const RevaluationDocument: React.FC<RevaluationDocumentProps> = (props) => {
  const { documentId } = useParams<RevaluationDocumentParams>();
  const history = useHistory();

  const { shopId, firmId } = props;

  const [
    revaluationDocument,
    setRevaluationDocument,
  ] = useState<UpdateRevaluationMutationVariables>();
  const [draftStatus, setDraftStatus] = useState<DraftStatus>(DraftStatus.default);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<UpdateRevaluationMutationVariables>>({});

  const canSave = useRef<boolean>(false);

  const { onError } = useContext(ErrorContext);

  const documentTitle = `Акт переоценки №${revaluationDocument?.revaluation.number} | ${TrinityTitle}`;
  const isDraft = revaluationDocument?.revaluation.status === RevaluationStatus.Draft;

  const { refetch: refetchRevaluation } = useGetRevaluationQuery({
    onError: handleGetRevaluationError,
    onCompleted: handleGetInvoiceCompleted,
    variables: {
      shopId,
      uuid: documentId,
    },
  });

  const [updateRevaluation] = useUpdateRevaluationMutation({
    onError: handleUpdateRevaluationError,
  });

  const [removeRevaluation] = useUpdateRevaluationMutation({
    onError: handleRemoveRevaluationError,
    onCompleted: () => history.push(RevaluationListRoute.getHref()),
  });

  useEffect(() => {
    if (!revaluationDocument || revaluationDocument.products.length === 0 || !isDraft) {
      return;
    }

    let timeout: number;
    if (canSave.current) {
      timeout = window.setTimeout(() => {
        setDraftStatus(DraftStatus.saving);
        updateRevaluation({ variables: revaluationDocument }).then(resetDraftStatus);
      }, 1000);
    }

    return () => window.clearTimeout(timeout);
  }, [isDraft, revaluationDocument, updateRevaluation]);

  return (
    <DocumentTitle title={documentTitle}>
      <Loader active={!revaluationDocument} style={{ padding: "100px 0" }}>
        {revaluationDocument && (
          <Root>
            <RevaluationDocumentHeader
              revaluation={revaluationDocument.revaluation}
              onRemove={handleRemove}
            />

            <Content>
              <ColoredContainer>
                <RevaluationDocumentContent
                  shopId={shopId}
                  firmId={firmId}
                  revaluationDocument={revaluationDocument}
                  onChange={handleChange}
                  errors={errors}
                  updateErrors={updateErrors}
                />

                {isDraft && (
                  <RevaluationDocumentControls
                    draftStatus={draftStatus}
                    onSend={handleSend}
                    loading={sending}
                    disabled={revaluationDocument.products.length === 0 || sending}
                  />
                )}
              </ColoredContainer>
            </Content>
          </Root>
        )}
      </Loader>
    </DocumentTitle>
  );

  function handleGetInvoiceCompleted(data: GetRevaluationQuery) {
    const revaluation = data.RevaluationGet;
    setRevaluationDocument(revaluation);
    setDraftStatus(DraftStatus.default);
  }

  async function handleSend() {
    if (!revaluationDocument || draftStatus === DraftStatus.saving) return;

    const { errors, isValid } = await validate(schema, revaluationDocument);

    if (!isValid) {
      setErrors(errors);
      return;
    }

    await updateRevaluation({
      variables: updateRevaluationStatus(revaluationDocument, RevaluationStatus.Completed),
    });
    const { data } = await refetchRevaluation();
    handleGetInvoiceCompleted(data);
    setSending(false);
  }

  async function handleRemove() {
    if (!revaluationDocument) return;
    await removeRevaluation({
      variables: updateRevaluationStatus(revaluationDocument, RevaluationStatus.Deleted),
    });
  }

  function handleGetRevaluationError(error: ApolloError) {
    onError({ title: revaluationErrors.getDocumentError, content: error.message });
  }

  function handleUpdateRevaluationError(error: ApolloError) {
    onError({ title: revaluationErrors.saveDocumentError, content: error.message });
  }

  function handleRemoveRevaluationError(error: ApolloError) {
    onError({ title: revaluationErrors.removeInvoiceError, content: error.message });
    throw new Error(error.message);
  }

  function resetDraftStatus() {
    setTimeout(() => setDraftStatus(DraftStatus.saved), 1000);
  }

  function handleChange(invoice: UpdateRevaluationMutationVariables) {
    canSave.current = true;
    setRevaluationDocument(invoice);
  }

  function updateErrors(newErrors: FieldErrors<UpdateInvoiceMutationVariables>) {
    setErrors(newErrors);
  }
};
