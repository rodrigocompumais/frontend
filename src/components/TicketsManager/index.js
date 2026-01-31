import React, { useContext, useEffect, useState } from "react";

import { 
  Badge,
  Button,
  FormControlLabel,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Switch
} from "@material-ui/core";

import {
  AllInboxRounded,
  HourglassEmptyRounded,
  MoveToInbox,
  Search
} from "@material-ui/icons";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";
import { TagsFilter } from "../TagsFilter";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePendingTicketNotification from "../../hooks/usePendingTicketNotification";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  tabsHeader: {
    flex: "none",
    backgroundColor: theme.palette.background.default,
  },

  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: 8,
  },

  tab: {
    minWidth: 120,
    width: 120,
  },

  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
  },

  serachInputWrapper: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
    display: "flex",
    borderRadius: 40,
    padding: 4,
    marginRight: theme.spacing(1),
  },

  searchIcon: {
    color: theme.palette.primary.main,
    marginLeft: 6,
    marginRight: 6,
    alignSelf: "center",
  },

  searchInput: {
    flex: 1,
    border: "none",
    borderRadius: 25,
    padding: "10px",
    outline: "none",
  },

  badge: {
    right: 0,
  },
  show: {
    display: "block",
  },
  hide: {
    display: "none !important",
  },
  searchContainer: {
    display: "flex",
    padding: "10px",
    borderBottom: "2px solid rgba(0, 0, 0, .12)",
  },
  subTabsContainer: {
    flex: "none",
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider || "rgba(0, 0, 0, 0.12)"}`,
  },
  subTab: {
    minWidth: 120,
    textTransform: "none",
  },
}));

const TicketsManager = () => {
  const classes = useStyles();

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const { user } = useContext(AuthContext);

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [checkMsgIsGroup, setCheckMsgIsGroup] = useState("enabled");
  const [subTab, setSubTab] = useState("conversas");
  const [conversationsCount, setConversationsCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);

  // Hook para notificação sonora de tickets pendentes
  usePendingTicketNotification();

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const { data } = await api.get("/settings");
        const setting = data.find((s) => s.key === "CheckMsgIsGroup");
        if (setting) {
          setCheckMsgIsGroup(setting.value || "enabled");
        }
      } catch (err) {
        toastError(err);
      }
    };
    fetchSetting();
  }, []);

  useEffect(() => {
    if (checkMsgIsGroup === "disabled") {
      setOpenCount(conversationsCount + groupsCount);
    }
  }, [conversationsCount, groupsCount, checkMsgIsGroup]);

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();


    setSearchParam(searchedTerm);
    if (searchedTerm === "") {
      setTab("open");
    } else if (tab !== "search") {
      setTab("search");
    }

  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map(t => t.id);
    setSelectedTags(tags);
  }

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeSubTab = (e, newValue) => {
    setSubTab(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  return (
    <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(e) => setNewTicketModalOpen(false)}
      />
      <Paper elevation={0} square className={classes.searchContainer}>
        <Search className={classes.searchIcon} />
        <input
          type="text"
          placeholder={i18n.t("tickets.search.placeholder")}
          className={classes.searchInput}
          value={searchParam}
          onChange={handleSearch}
        />
      </Paper>
      <Paper elevation={0} square className={classes.tabsHeader}>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
        >
          <Tab
            value={"open"}
            icon={<MoveToInbox />}
            label={
              <Badge
                className={classes.badge}
                badgeContent={openCount}
                overlap="rectangular"
                color="secondary"
              >
                {i18n.t("tickets.tabs.open.title")}
              </Badge>
            }
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"pending"}
            icon={<HourglassEmptyRounded />}
            label={
              <Badge
                className={classes.badge}
                badgeContent={pendingCount}
                overlap="rectangular"
                color="secondary"
              >
                {i18n.t("ticketsList.pendingHeader")}
              </Badge>
            }
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"closed"}
            icon={<AllInboxRounded />}
            label={i18n.t("tickets.tabs.closed.title")}
            classes={{ root: classes.tab }}
          />
        </Tabs>
      </Paper>
      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setNewTicketModalOpen(true)}
        >
          {i18n.t("ticketsManager.buttons.newTicket")}
        </Button>
        <Can
          role={user.profile}
          perform="tickets-manager:showall"
          yes={() => (
            <FormControlLabel
              label={i18n.t("tickets.buttons.showAll")}
              labelPlacement="start"
              control={
                <Switch
                  size="small"
                  checked={showAllTickets}
                  onChange={() =>
                    setShowAllTickets((prevState) => !prevState)
                  }
                  name="showAllTickets"
                  color="primary"
                />
              }
            />
          )}
        />
        <TicketsQueueSelect
          style={{ marginLeft: 6 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
      </Paper>
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper} keepMounted={true}>
        <TagsFilter onFiltered={handleSelectedTags} />
        {checkMsgIsGroup === "disabled" && (
          <Paper elevation={0} square className={classes.subTabsContainer}>
            <Tabs
              value={subTab}
              onChange={handleChangeSubTab}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab
                value="conversas"
                label={
                  <Badge
                    className={classes.badge}
                    badgeContent={conversationsCount}
                    overlap="rectangular"
                    color="secondary"
                  >
                    {i18n.t("tickets.tabs.subTabs.conversations")}
                  </Badge>
                }
                className={classes.subTab}
              />
              <Tab
                value="grupos"
                label={
                  <Badge
                    className={classes.badge}
                    badgeContent={groupsCount}
                    overlap="rectangular"
                    color="secondary"
                  >
                    {i18n.t("tickets.tabs.subTabs.groups")}
                  </Badge>
                }
                className={classes.subTab}
              />
            </Tabs>
          </Paper>
        )}
        <Paper className={classes.ticketsWrapper}>
          {checkMsgIsGroup === "disabled" ? (
            <>
              {subTab === "conversas" && (
                <TicketsList
                  status="open"
                  showAll={showAllTickets}
                  selectedQueueIds={selectedQueueIds}
                  updateCount={(val) => setConversationsCount(val)}
                  filterIsGroup={false}
                  style={applyPanelStyle("open")}
                />
              )}
              {subTab === "grupos" && (
                <TicketsList
                  status="open"
                  showAll={showAllTickets}
                  selectedQueueIds={selectedQueueIds}
                  updateCount={(val) => setGroupsCount(val)}
                  filterIsGroup={true}
                  style={applyPanelStyle("open")}
                />
              )}
            </>
          ) : (
            <>
              <TicketsList
                status="open"
                showAll={showAllTickets}
                selectedQueueIds={selectedQueueIds}
                updateCount={(val) => setOpenCount(val)}
                style={applyPanelStyle("open")}
              />
            </>
          )}
          <TicketsList
            status="pending"
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
          />
        </Paper>
      </TabPanel>

      <TabPanel value={tab} name="pending" className={classes.ticketsWrapper} keepMounted={true}>
      <TagsFilter onFiltered={handleSelectedTags} />
        <TicketsList
          status="pending"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setPendingCount(val)}
        />
      </TabPanel>



      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
      <TagsFilter onFiltered={handleSelectedTags} />
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
      <TagsFilter onFiltered={handleSelectedTags} />
        <TicketsList
          searchParam={searchParam}
          tags={selectedTags}
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
    </Paper>
  );
};

export default TicketsManager;