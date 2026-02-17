import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Tabs, Tab } from "@material-ui/core";
import EventSeatIcon from "@material-ui/icons/EventSeat";
import LocalShippingIcon from "@material-ui/icons/LocalShipping";
import useCompanyModules from "../../hooks/useCompanyModules";
import Pedidos from "../Pedidos";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: theme.palette.fancyBackground,
    overflow: "hidden",
  },
  tabs: {
    flexShrink: 0,
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    minHeight: 64,
    [theme.breakpoints.up("sm")]: {
      minHeight: 72,
    },
  },
  tabRoot: {
    minHeight: 64,
    padding: theme.spacing(1, 2),
    fontWeight: 700,
    [theme.breakpoints.up("sm")]: {
      minHeight: 72,
      fontSize: "1rem",
    },
  },
  tabWrapper: {
    flexDirection: "row",
    gap: theme.spacing(1),
  },
  tabPanel: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
}));

const Cozinha = () => {
  const classes = useStyles();
  const history = useHistory();
  const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!hasLanchonetes && !modulesLoading) {
      history.push("/dashboard");
    }
  }, [hasLanchonetes, modulesLoading, history]);

  if (!hasLanchonetes && !modulesLoading) return null;

  return (
    <Box className={classes.root}>
      <Tabs
        value={tabValue}
        onChange={(_, v) => setTabValue(v)}
        className={classes.tabs}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab
          label="Pedidos mesa"
          icon={<EventSeatIcon />}
          classes={{ root: classes.tabRoot, wrapper: classes.tabWrapper }}
        />
        <Tab
          label="Pedidos delivery"
          icon={<LocalShippingIcon />}
          classes={{ root: classes.tabRoot, wrapper: classes.tabWrapper }}
        />
      </Tabs>
      <Box className={classes.tabPanel} role="tabpanel" hidden={tabValue !== 0} style={{ display: tabValue !== 0 ? "none" : "flex" }}>
        {tabValue === 0 && (
          <Box width="100%" flex={1} minHeight={0} display="flex" flexDirection="column" overflow="hidden">
            <Pedidos orderTypeFilter="mesa" minimal />
          </Box>
        )}
      </Box>
      <Box className={classes.tabPanel} role="tabpanel" hidden={tabValue !== 1} style={{ display: tabValue !== 1 ? "none" : "flex" }}>
        {tabValue === 1 && (
          <Box width="100%" flex={1} minHeight={0} display="flex" flexDirection="column" overflow="hidden">
            <Pedidos orderTypeFilter="delivery" minimal />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Cozinha;
