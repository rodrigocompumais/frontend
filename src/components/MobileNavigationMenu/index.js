import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  makeStyles,
  Collapse,
  ListSubheader,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import {
  WhatsApp as WhatsAppIcon,
  TableChart as TableChartIcon,
  Forum as ForumIcon,
  FlashOn as FlashOnIcon,
  BorderColor as BorderColorIcon,
  Event as EventIcon,
  ContactPhone as ContactPhoneIcon,
  LocalOffer as LocalOfferIcon,
  EventAvailable as EventAvailableIcon,
  AccountTree as AccountTreeIcon,
  AllInclusive as AllInclusiveIcon,
  People as PeopleIcon,
  SyncAlt as SyncAltIcon,
  AttachFile as AttachFileIcon,
  AccountTreeOutlined as AccountTreeOutlinedIcon,
  DeviceHubOutlined as DeviceHubOutlinedIcon,
  CodeRounded as CodeRoundedIcon,
  LocalAtm as LocalAtmIcon,
  Announcement as AnnouncementIcon,
  HelpOutline as HelpOutlineIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  ExpandLess,
  ExpandMore,
  ShoppingCart as ShoppingCartIcon,
} from '@material-ui/icons';
import { Badge } from '@material-ui/core';
import { i18n } from '../../translate/i18n';
import { Can } from '../Can';
import { AuthContext } from '../../context/Auth/AuthContext';
import { WhatsAppsContext } from '../../context/WhatsApp/WhatsAppsContext';
import usePlans from '../../hooks/usePlans';

const useStyles = makeStyles((theme) => ({
  list: {
    width: 280,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  menuButton: {
    marginRight: theme.spacing(2),
    color: 'white',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  subheader: {
    backgroundColor: theme.palette.background.paper,
    fontWeight: 600,
  },
  logo: {
    width: '60%',
    height: 'auto',
    maxWidth: 150,
    margin: theme.spacing(2),
  },
}));

const MobileNavigationMenu = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { whatsApps } = useContext(WhatsAppsContext);
  const { getPlanCompany } = usePlans();

  // Submenus
  const [openAutomacao, setOpenAutomacao] = useState(false);

  // Features do plano
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [connectionWarning, setConnectionWarning] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
  }, [user.companyId, getPlanCompany]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleNavigate = (path) => {
    history.push(path);
    setOpen(false);
  };

  return (
    <>
      <IconButton
        edge="start"
        className={classes.menuButton}
        onClick={handleToggle}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className={classes.list}>
          <List>
            {/* ATENDIMENTO */}
            <ListSubheader className={classes.subheader}>
              {i18n.t("navigation.atendimento")}
            </ListSubheader>
            <ListItem button onClick={() => handleNavigate('/tickets')}>
              <ListItemIcon>
                <WhatsAppIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.tickets")} />
            </ListItem>
            {showKanban && (
              <ListItem button onClick={() => handleNavigate('/kanban')}>
                <ListItemIcon>
                  <TableChartIcon />
                </ListItemIcon>
                <ListItemText primary="Kanban" />
              </ListItem>
            )}
            {showInternalChat && (
              <ListItem button onClick={() => handleNavigate('/chats')}>
                <ListItemIcon>
                  <ForumIcon />
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.chats")} />
              </ListItem>
            )}
            <ListItem button onClick={() => handleNavigate('/quick-messages')}>
              <ListItemIcon>
                <FlashOnIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.quickMessages")} />
            </ListItem>

            <Divider />

            {/* GESTÃO */}
            <ListSubheader className={classes.subheader}>
              {i18n.t("navigation.gestao")}
            </ListSubheader>
            <ListItem button onClick={() => handleNavigate('/todolist')}>
              <ListItemIcon>
                <BorderColorIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.tasks")} />
            </ListItem>
            <ListItem button onClick={() => handleNavigate('/schedules')}>
              <ListItemIcon>
                <EventIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.schedules")} />
            </ListItem>
            <ListItem button onClick={() => handleNavigate('/contacts')}>
              <ListItemIcon>
                <ContactPhoneIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.contacts")} />
            </ListItem>
            <ListItem button onClick={() => handleNavigate('/tags')}>
              <ListItemIcon>
                <LocalOfferIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.tags")} />
            </ListItem>
            <ListItem button onClick={() => handleNavigate('/products')}>
              <ListItemIcon>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText primary="Produtos" />
            </ListItem>

            {(showCampaigns || showOpenAi) && (
              <>
                <Divider />

                {/* AUTOMAÇÃO & IA */}
                <ListSubheader className={classes.subheader}>
                  {i18n.t("navigation.automacaoIA")}
                </ListSubheader>
                {showCampaigns && (
                  <>
                    <ListItem button onClick={() => setOpenAutomacao(!openAutomacao)}>
                      <ListItemIcon>
                        <EventAvailableIcon />
                      </ListItemIcon>
                      <ListItemText primary={i18n.t("mainDrawer.listItems.campaigns")} />
                      {openAutomacao ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={openAutomacao} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        <ListItem button className={classes.nested} onClick={() => handleNavigate('/campaigns')}>
                          <ListItemText primary="Listagem" />
                        </ListItem>
                        <ListItem button className={classes.nested} onClick={() => handleNavigate('/contact-lists')}>
                          <ListItemText primary="Listas de Contatos" />
                        </ListItem>
                      </List>
                    </Collapse>
                    <ListItem button onClick={() => handleNavigate('/flowbuilders')}>
                      <ListItemIcon>
                        <AccountTreeIcon />
                      </ListItemIcon>
                      <ListItemText primary={i18n.t("mainDrawer.listItems.flows")} />
                    </ListItem>
                  </>
                )}
                {showOpenAi && (
                  <ListItem button onClick={() => handleNavigate('/prompts')}>
                    <ListItemIcon>
                      <AllInclusiveIcon />
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.listItems.prompts")} />
                  </ListItem>
                )}
              </>
            )}

            <Can
              role={user.profile}
              perform="drawer-admin-items:view"
              yes={() => (
                <>
                  <Divider />

                  {/* ADMINISTRAÇÃO */}
                  <ListSubheader className={classes.subheader}>
                    {i18n.t("navigation.administracao")}
                  </ListSubheader>
                  <ListItem button onClick={() => handleNavigate('/users')}>
                    <ListItemIcon>
                      <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.listItems.users")} />
                  </ListItem>
                  <ListItem button onClick={() => handleNavigate('/connections')}>
                    <ListItemIcon>
                      <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                        <SyncAltIcon />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.listItems.connections")} />
                  </ListItem>
                  <ListItem button onClick={() => handleNavigate('/queues')}>
                    <ListItemIcon>
                      <AccountTreeOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.listItems.queues")} />
                  </ListItem>
                  <ListItem button onClick={() => handleNavigate('/files')}>
                    <ListItemIcon>
                      <AttachFileIcon />
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.listItems.files")} />
                  </ListItem>
                  {showIntegrations && (
                    <ListItem button onClick={() => handleNavigate('/queue-integration')}>
                      <ListItemIcon>
                        <DeviceHubOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText primary={i18n.t("mainDrawer.listItems.queueIntegration")} />
                    </ListItem>
                  )}
                  {showExternalApi && (
                    <ListItem button onClick={() => handleNavigate('/messages-api')}>
                      <ListItemIcon>
                        <CodeRoundedIcon />
                      </ListItemIcon>
                      <ListItemText primary={i18n.t("mainDrawer.listItems.messagesAPI")} />
                    </ListItem>
                  )}
                  <ListItem button onClick={() => handleNavigate('/financeiro')}>
                    <ListItemIcon>
                      <LocalAtmIcon />
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.listItems.financeiro")} />
                  </ListItem>
                  {user.super && (
                    <ListItem button onClick={() => handleNavigate('/announcements')}>
                      <ListItemIcon>
                        <AnnouncementIcon />
                      </ListItemIcon>
                      <ListItemText primary={i18n.t("mainDrawer.listItems.annoucements")} />
                    </ListItem>
                  )}
                </>
              )}
            />

            <Divider />

            {/* SISTEMA */}
            <ListSubheader className={classes.subheader}>
              {i18n.t("navigation.sistema")}
            </ListSubheader>
            <ListItem button onClick={() => handleNavigate('/helps')}>
              <ListItemIcon>
                <HelpOutlineIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.helps")} />
            </ListItem>
            <Can
              role={user.profile}
              perform="drawer-admin-items:view"
              yes={() => (
                <ListItem button onClick={() => handleNavigate('/settings')}>
                  <ListItemIcon>
                    <SettingsOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t("mainDrawer.listItems.settings")} />
                </ListItem>
              )}
            />
          </List>
        </div>
      </Drawer>
    </>
  );
};

export default MobileNavigationMenu;
