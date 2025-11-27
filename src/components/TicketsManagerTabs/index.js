import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Badge from "@material-ui/core/Badge";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import FilterListIcon from "@material-ui/icons/FilterList";
import AddIcon from "@material-ui/icons/Add";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsListCustom";
import TabPanel from "../TabPanel";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { Button } from "@material-ui/core";
import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";

const useStyles = makeStyles(theme => ({
	ticketsWrapper: {
		position: "relative",
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflow: "hidden",
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
		borderRadius:0,
	},

	tabsHeader: {
		flex: "none",
		backgroundColor: theme.palette.tabHeaderBackground,
		padding: theme.spacing(1, 2),
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
	},

	tabSelect: {
		minWidth: 180,
		"& .MuiSelect-select": {
			padding: theme.spacing(1, 2),
			display: "flex",
			alignItems: "center",
			gap: theme.spacing(1),
		},
	},

	tabsInternal: {
		flex: "none",
		backgroundColor: theme.palette.tabHeaderBackground
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

	internalTab: {
		minWidth: 120,
		width: 120,
		padding: 5
	},

	ticketOptionsBox: {
		display: "flex",
		justifyContent: "flex-end",
		alignItems: "center",
		background: theme.palette.optionsBackground,
		padding: theme.spacing(1),
		gap: theme.spacing(1),
	},

	filterMenu: {
		"& .MuiPaper-root": {
			minWidth: 250,
		},
	},

	filterMenuItem: {
		padding: theme.spacing(1.5, 2),
	},

	filterMenuSection: {
		padding: theme.spacing(1, 2),
		borderBottom: `1px solid ${theme.palette.divider}`,
		"&:last-child": {
			borderBottom: "none",
		},
	},

	ticketSearchLine: {
		padding: theme.spacing(1),
	},

	serachInputWrapper: {
		flex: 1,
		background: theme.palette.total,
		display: "flex",
		borderRadius: 40,
		padding: 4,
		marginRight: theme.spacing(1),
	},

	searchIcon: {
		color: "grey",
		marginLeft: 6,
		marginRight: 6,
		alignSelf: "center",
	},

	searchInput: {
		flex: 1,
		border: "none",
		borderRadius: 30,
	},

	insiderTabPanel: {
		height: '100%',
		marginTop: "-72px",
		paddingTop: "72px"
	},

	insiderDoubleTabPanel: {
		display:"flex",
		flexDirection: "column",
		marginTop: "-72px",
		paddingTop: "72px",
		height: "100%"
	},

	labelContainer: {
		width: "auto",
		padding: 0
	},
	iconLabelWrapper: {
		flexDirection: "row",
		'& > *:first-child': {
			marginBottom: '3px !important',
			marginRight: 16
		}
	},
	insiderTabLabel: {
		[theme.breakpoints.down(1600)]: {
			display:'none'
		}
	},
	smallFormControl: {
		'& .MuiOutlinedInput-input': {
			padding: "12px 10px",
		},
		'& .MuiInputLabel-outlined': {
			marginTop: "-6px"
		}
	}
}));

const TicketsManagerTabs = () => {
  const classes = useStyles();
  const history = useHistory();

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const { profile } = user;

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
    }
  }, [tab]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      setTab("open");
      return;
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
    }, 500);
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { 
        display: "none",
        width: 0, 
        height: 0,
        overflow: "hidden"
      };
    }
    return {};
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    setSelectedTags(tags);
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setSelectedUsers(users);
  };

  const handleOpenFilterMenu = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleCloseFilterMenu = () => {
    setFilterMenuAnchor(null);
  };

  const filterMenuOpen = Boolean(filterMenuAnchor);

  const getTabLabel = (value) => {
    switch (value) {
      case "open":
        return i18n.t("tickets.tabs.open.title");
      case "closed":
        return i18n.t("tickets.tabs.closed.title");
      case "search":
        return i18n.t("tickets.tabs.search.title");
      default:
        return "";
    }
  };

  const getTabIcon = (value) => {
    switch (value) {
      case "open":
        return <MoveToInboxIcon fontSize="small" />;
      case "closed":
        return <CheckBoxIcon fontSize="small" />;
      case "search":
        return <SearchIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(ticket) => {
          
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <Paper elevation={0} square className={classes.tabsHeader}>
        <FormControl variant="outlined" size="small" className={classes.tabSelect}>
          <Select
            value={tab}
            onChange={(e) => handleChangeTab(null, e.target.value)}
            displayEmpty
          >
            <MenuItem value="open">
              <Box display="flex" alignItems="center" gap={1}>
                <MoveToInboxIcon fontSize="small" />
                <Typography>{i18n.t("tickets.tabs.open.title")}</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="closed">
              <Box display="flex" alignItems="center" gap={1}>
                <CheckBoxIcon fontSize="small" />
                <Typography>{i18n.t("tickets.tabs.closed.title")}</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="search">
              <Box display="flex" alignItems="center" gap={1}>
                <SearchIcon fontSize="small" />
                <Typography>{i18n.t("tickets.tabs.search.title")}</Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Paper>
      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        {tab === "search" ? (
          <div className={classes.serachInputWrapper}>
            <SearchIcon className={classes.searchIcon} />
            <InputBase
              className={classes.searchInput}
              inputRef={searchInputRef}
              placeholder={i18n.t("tickets.search.placeholder")}
              type="search"
              onChange={handleSearch}
            />
          </div>
        ) : (
          <>
            <IconButton
              color="primary"
              onClick={() => setNewTicketModalOpen(true)}
              size="small"
              style={{ marginRight: 8 }}
            >
              <AddIcon />
            </IconButton>
            <IconButton
              onClick={handleOpenFilterMenu}
              size="small"
              color={filterMenuOpen ? "primary" : "default"}
            >
              <FilterListIcon />
            </IconButton>
            <Menu
              anchorEl={filterMenuAnchor}
              open={filterMenuOpen}
              onClose={handleCloseFilterMenu}
              className={classes.filterMenu}
            >
              <Box className={classes.filterMenuSection}>
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
              </Box>
              <Divider />
              <Box className={classes.filterMenuSection}>
                <Typography variant="caption" color="textSecondary" style={{ padding: "8px 16px" }}>
                  Filas
                </Typography>
                <TicketsQueueSelect
                  selectedQueueIds={selectedQueueIds}
                  userQueues={user?.queues}
                  onChange={(values) => setSelectedQueueIds(values)}
                />
              </Box>
            </Menu>
          </>
        )}
      </Paper>
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <Badge
                className={classes.badge}
                badgeContent={openCount}
                color="primary"
              >
                {i18n.t("ticketsList.assignedHeader")}
              </Badge>
            }
            value={"open"}
          />
          <Tab
            label={
              <Badge
                className={classes.badge}
                badgeContent={pendingCount}
                color="secondary"
              >
                {i18n.t("ticketsList.pendingHeader")}
              </Badge>
            }
            value={"pending"}
          />
        </Tabs>
        <Paper className={classes.ticketsWrapper}>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
          />
          <TicketsList
            status="pending"
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
          />
        </Paper>
      </TabPanel>
      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        <TagsFilter onFiltered={handleSelectedTags} />
        {profile === "admin" && (
          <UsersFilter onFiltered={handleSelectedUsers} />
        )}
        <TicketsList
          searchParam={searchParam}
          showAll={true}
          tags={selectedTags}
          users={selectedUsers}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
    </Paper>
  );
};

export default TicketsManagerTabs;
