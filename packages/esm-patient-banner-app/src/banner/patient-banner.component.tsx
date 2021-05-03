import React, { useEffect, useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import Button from "carbon-components-react/es/components/Button";
import Tag from "carbon-components-react/es/components/Tag";
import TooltipDefinition from "carbon-components-react/es/components/TooltipDefinition";
import ChevronDown16 from "@carbon/icons-react/es/chevron--down/16";
import ChevronUp16 from "@carbon/icons-react/es/chevron--up/16";
import OverflowMenuVertical16 from "@carbon/icons-react/es/overflow-menu--vertical/16";
import capitalize from "lodash-es/capitalize";
import ContactDetails from "../contact-details/contact-details.component";
import CustomOverflowMenuComponent from "../ui-components/overflow-menu.component";
import styles from "./patient-banner.scss";
import {
  ExtensionSlot,
  age,
  useVisit,
  getStartedVisit,
  VisitItem,
  Extension,
} from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";

interface PatientBannerProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  patientUuid,
}) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [hasActiveVisit, setActiveVisit] = useState(false);
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const toggleContactDetails = useCallback(
    () => setShowContactDetails((value) => !value),
    []
  );

  useEffect(() => {
    if (currentVisit) {
      setActiveVisit(true);
    } else {
      const sub = getStartedVisit.subscribe((visit?: VisitItem) => {
        setActiveVisit(visit !== null);
      });

      return () => sub.unsubscribe();
    }
  }, [currentVisit]);

  return (
    <div className={styles.container}>
      <div className={styles.patientBanner}>
        <div className={styles.patientAvatar}>
          <ExtensionSlot extensionSlotName="patient-photo-slot" state={state} />
        </div>
        <div className={styles.patientInfo}>
          <div className={(styles.row, styles.nameRow)}>
            <div>
              <span className={styles.patientName}>
                {patient.name[0].given.join(" ")} {patient.name[0].family}
              </span>
              {hasActiveVisit && (
                <TooltipDefinition
                  align="end"
                  tooltipText={
                    <div className={styles.tooltipPadding}>
                      <h6 style={{ marginBottom: "0.5rem" }}>
                        {currentVisit &&
                          currentVisit.visitType &&
                          currentVisit.visitType.name}
                      </h6>
                      <span>
                        <span className={styles.tooltipSmallText}>
                          Started:{" "}
                        </span>
                        <span>
                          {dayjs(
                            currentVisit && currentVisit.startDatetime
                          ).format("DD - MMM - YYYY @ HH:mm")}
                        </span>
                      </span>
                    </div>
                  }
                >
                  <Tag type="blue">{t("activeVisit", "Active Visit")}</Tag>
                </TooltipDefinition>
              )}
            </div>
            <div>
              <CustomOverflowMenuComponent
                menuTitle={
                  <>
                    <span className={styles.actionsButtonText}>Actions</span>{" "}
                    <OverflowMenuVertical16 style={{ marginLeft: "0.5rem" }} />
                  </>
                }
              >
                <ExtensionSlot
                  extensionSlotName="patient-actions-slot"
                  key="patient-actions-slot"
                  className={styles.overflowMenuItemList}
                  state={state}
                />
              </CustomOverflowMenuComponent>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.demographics}>
              <span>{capitalize(patient.gender)}</span> &middot;{" "}
              <span>{age(patient.birthDate)}</span> &middot;{" "}
              <span>{dayjs(patient.birthDate).format("DD - MMM - YYYY")}</span>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.identifiers}>
              {patient.identifier.map((i) => i.value).join(", ")}
            </span>
            <Button
              kind="ghost"
              renderIcon={showContactDetails ? ChevronUp16 : ChevronDown16}
              iconDescription="Toggle contact details"
              onClick={toggleContactDetails}
              style={{ marginTop: "-0.25rem" }}
            >
              {showContactDetails
                ? t("hideAllDetails", "Hide all details")
                : t("showAllDetails", "Show all details")}
            </Button>
          </div>
        </div>
      </div>
      {showContactDetails && (
        <ContactDetails
          address={patient.address}
          telecom={patient.telecom}
          patientId={patient.id}
        />
      )}
    </div>
  );
};

export default PatientBanner;
