import React, { useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import HistoryIcon from "@material-ui/icons/History";
import PersonIcon from "@material-ui/icons/Person";
import ListAltIcon from "@material-ui/icons/ListAlt";
import ChatIcon from "@material-ui/icons/Chat";
import TicketsHistoryManager from "../../components/TicketsHistoryManager";
import ClosedContactPanel from "../../components/ClosedContactPanel";
import ClosedTicketPanel from "../../components/ClosedTicketPanel";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    flex: 1,
    padding: theme.spacing(1),
    height: `calc(100vh - 56px)`,
    overflow: "hidden",
    backgroundColor: theme.palette.type === "dark" ? theme.palette.background.default : "#F5F5F5",
  },
  chatPapper: {
    display: "flex",
    height: "100%",
  },
  contactsWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
  },
  messagesWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
  },
  welcomeMsg: {
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
    padding: theme.spacing(4, 3),
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
  },
  welcomeIcon: {
    fontSize: 56,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  stepRow: {
    display: "flex",
    alignItems: "flex-start",
    textAlign: "left",
    width: "100%",
    maxWidth: 420,
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5, 2),
    borderRadius: 10,
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(255,255,255,0.04)"
        : "rgba(249, 115, 22, 0.06)",
    border: `1px solid ${theme.palette.divider}`,
  },
  stepNumber: {
    minWidth: 32,
    height: 32,
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1rem",
    marginRight: theme.spacing(2),
    flexShrink: 0,
  },
  pageIntro: {
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 10,
    border: `1px solid ${theme.palette.divider}`,
  },
}));

const WelcomeSteps = ({ classes }) => (
  <Box mt={3} width="100%" display="flex" flexDirection="column" alignItems="center">
    {[
      { n: 1, text: i18n.t("ticketsHistory.welcomeStep1"), icon: <PersonIcon color="primary" /> },
      { n: 2, text: i18n.t("ticketsHistory.welcomeStep2"), icon: <ListAltIcon color="primary" /> },
      { n: 3, text: i18n.t("ticketsHistory.welcomeStep3"), icon: <ChatIcon color="primary" /> },
    ].map((step) => (
      <div key={step.n} className={classes.stepRow}>
        <span className={classes.stepNumber}>{step.n}</span>
        <Box display="flex" alignItems="center">
          <Box mr={1.5} display="flex">
            {step.icon}
          </Box>
          <Typography variant="body1" style={{ fontSize: "1rem", lineHeight: 1.5 }}>
            {step.text}
          </Typography>
        </Box>
      </div>
    ))}
  </Box>
);

const TicketsFinalizadas = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { ticketId: ticketUuid } = useParams();
  const [selectedGroup, setSelectedGroup] = useState(null);

  const selectedContactId = selectedGroup?.contact?.id;
  const hasDetail = Boolean(ticketUuid || selectedGroup);
  const showList = !isMobile || !hasDetail;
  const showDetail = !isMobile || hasDetail;

  const handleBackToList = () => {
    setSelectedGroup(null);
    history.push("/tickets/finalizadas");
  };

  const handleBackToSessions = () => {
    if (ticketUuid && selectedGroup?.contact) {
      history.push("/tickets/finalizadas");
      return;
    }
    handleBackToList();
  };

  const renderRightPanel = () => {
    if (ticketUuid) {
      return (
        <ClosedTicketPanel
          ticketUuid={ticketUuid}
          onBack={isMobile ? handleBackToSessions : undefined}
        />
      );
    }
    if (selectedGroup) {
      return (
        <ClosedContactPanel
          contact={selectedGroup.contact}
          group={selectedGroup}
          onBack={isMobile ? handleBackToList : undefined}
        />
      );
    }
    return (
      <Paper square variant="outlined" className={classes.welcomeMsg}>
        <HistoryIcon className={classes.welcomeIcon} />
        <Typography variant="h5" color="textPrimary" style={{ fontWeight: 600 }}>
          {i18n.t("ticketsHistory.welcomeTitle")}
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          style={{ marginTop: 12, maxWidth: 480, lineHeight: 1.6 }}
        >
          {i18n.t("ticketsHistory.welcomeSubtitle")}
        </Typography>
        <WelcomeSteps classes={classes} />
      </Paper>
    );
  };

  return (
    <div className={classes.chatContainer}>
      {!isMobile && (
        <Box className={classes.pageIntro}>
          <Typography variant="body1" color="textSecondary" style={{ lineHeight: 1.5 }}>
            {i18n.t("ticketsHistory.pageSubtitle")}
          </Typography>
        </Box>
      )}
      <div className={classes.chatPapper}>
        <Grid container spacing={1}>
          {showList && (
            <Grid item xs={12} md={4} className={classes.contactsWrapper}>
              <TicketsHistoryManager
                selectedContactId={selectedContactId}
                onSelectContact={setSelectedGroup}
                compactIntro={isMobile}
              />
            </Grid>
          )}
          {showDetail && (
            <Grid item xs={12} md={8} className={classes.messagesWrapper}>
              {renderRightPanel()}
            </Grid>
          )}
        </Grid>
      </div>
    </div>
  );
};

export default TicketsFinalizadas;
