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
  History as HistoryIcon,
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
  Assignment as AssignmentIcon,
  Receipt as ReceiptIcon,
  } from '@material-ui/icons';
import { Badge } from '@material-ui/core';
import { i18n } from '../../translate/i18n';
import NavPageGate from '../NavPageGate';
import { AuthContext } from '../../context/Auth/AuthContext';
import { ADMIN_PAGE_KEYS } from '../../constants/pagePermissions';
import usePageAccess from '../../hooks/usePageAccess';
import { WhatsAppsContext } from '../../context/WhatsApp/WhatsAppsContext';
import usePlans from '../../hooks/usePlans';
import useCompanyModules from '../../hooks/useCompanyModules';
import useInternalChatUnreadCount from '../../hooks/useInternalChatUnreadCount';

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

const PageListItem = ({ pageKey, onClick, children, ...rest }) => (
  <NavPageGate pageKey={pageKey}>
    <ListItem button onClick={onClick} {...rest}>
      {children}
    </ListItem>
  </NavPageGate>
);

const MobileNavigationMenu = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { hasAnyPageAccess, canAccessPage } = usePageAccess();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { getPlanCompany } = usePlans();
  const { hasLanchonetes, hasAgendamento } = useCompanyModules();
  const { unreadChatCount } = useInternalChatUnreadCount();

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
    if (!user?.companyId) return;
    let cancelled = false;
    (async () => {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (cancelled) return;
      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    })();
    return () => { cancelled = true; };
  }, [user?.companyId, getPlanCompany]);

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

  const showAdminSection = hasAnyPageAccess(user, ADMIN_PAGE_KEYS);
  const showAutomacaoMenu =
    (showCampaigns || showOpenAi) &&
    hasAnyPageAccess(user, [
      "campaigns",
      "contact-lists",
      "flowbuilders",
      "prompts",
    ]);

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
            <PageListItem pageKey="tickets" onClick={() => handleNavigate('/tickets')}>
              <ListItemIcon>
                <WhatsAppIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.tickets")} />
            </PageListItem>
            <PageListItem pageKey="tickets-finalizadas" onClick={() => handleNavigate('/tickets/finalizadas')}>
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.ticketsFinalizadas")} />
            </PageListItem>
            {showKanban && (
              <PageListItem pageKey="kanban" onClick={() => handleNavigate('/kanban')}>
                <ListItemIcon>
                  <TableChartIcon />
                </ListItemIcon>
                <ListItemText primary="Kanban" />
              </PageListItem>
            )}
            {showInternalChat && (
              <PageListItem pageKey="chats" onClick={() => handleNavigate('/chats')}>
                <ListItemIcon>
                  <Badge badgeContent={unreadChatCount > 0 ? unreadChatCount : 0} color="error" max={99}>
                    <ForumIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.chats")} />
              </PageListItem>
            )}
            <PageListItem pageKey="quick-messages" onClick={() => handleNavigate('/quick-messages')}>
              <ListItemIcon>
                <FlashOnIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.quickMessages")} />
            </PageListItem>

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
            {hasAgendamento && (
              <ListItem button onClick={() => handleNavigate('/agendamento')}>
                <ListItemIcon>
                  <EventIcon />
                </ListItemIcon>
                <ListItemText primary={i18n.t("agendamento.hubName")} />
              </ListItem>
            )}
            {hasLanchonetes && (
              <>
                <ListItem button onClick={() => handleNavigate('/products')}>
                  <ListItemIcon>
                    <ShoppingCartIcon />
                  </ListItemIcon>
                  <ListItemText primary="Produtos" />
                </ListItem>
                <ListItem button onClick={() => handleNavigate('/pedidos')}>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="Pedidos" />
                </ListItem>
                <ListItem button onClick={() => handleNavigate('/mesas')}>
                  <ListItemIcon>
                    <TableChartIcon />
                  </ListItemIcon>
                  <ListItemText primary="Mesas" />
                </ListItem>
                <ListItem button onClick={() => handleNavigate('/pdv')}>
                  <ListItemIcon>
                    <ReceiptIcon />
                  </ListItemIcon>
                  <ListItemText primary="PDV" />
                </ListItem>
                </>
            )}

            {showAutomacaoMenu && (
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

            {showAdminSection && (
                <>
                  <Divider />

                  {/* ADMINISTRAÇÃO */}
                  <ListSubheader className={classes.subheader}>
                    {i18n.t("navigation.administracao")}
                  </ListSubheader>
                  <PageListItem pageKey="users" onClick={() => handleNavigate('/users')}>
                    <ListItemIcon>
                      <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.listItems.users")} />
                  </PageListItem>
                  <PageListItem pageKey="connections" onClick={() => handleNavigate('/connections')}>
                    <ListItemIcon>
                      <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                        <SyncAltIcon />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.listItems.connections")} />
                  </PageListItem>
                  <PageListItem pageKey="queues" onClick={() => handleNavigate('/queues')}>
                    <ListItemIcon>
                      <AccountTreeOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.listItems.queues")} />
                  </PageListItem>
                  <PageListItem pageKey="files" onClick={() => handleNavigate('/files')}>
                    <ListItemIcon>
                      <AttachFileIcon />
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.listItems.files")} />
                  </PageListItem>
                  {showIntegrations && (
                    <PageListItem pageKey="queue-integration" onClick={() => handleNavigate('/queue-integration')}>
                      <ListItemIcon>
                        <DeviceHubOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText primary={i18n.t("mainDrawer.listItems.queueIntegration")} />
                    </PageListItem>
                  )}
                  {showExternalApi && (
                    <PageListItem pageKey="messages-api" onClick={() => handleNavigate('/messages-api')}>
                      <ListItemIcon>
                        <CodeRoundedIcon />
                      </ListItemIcon>
                      <ListItemText primary={i18n.t("mainDrawer.listItems.messagesAPI")} />
                    </PageListItem>
                  )}
                  <PageListItem pageKey="financeiro" onClick={() => handleNavigate('/financeiro')}>
                    <ListItemIcon>
                      <LocalAtmIcon />
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.listItems.financeiro")} />
                  </PageListItem>
                  {user.super && canAccessPage(user, "announcements") && (
                    <PageListItem pageKey="announcements" onClick={() => handleNavigate('/announcements')}>
                      <ListItemIcon>
                        <AnnouncementIcon />
                      </ListItemIcon>
                      <ListItemText primary={i18n.t("mainDrawer.listItems.annoucements")} />
                    </PageListItem>
                  )}
                </>
            )}

            <Divider />

            {/* SISTEMA */}
            <ListSubheader className={classes.subheader}>
              {i18n.t("navigation.sistema")}
            </ListSubheader>
            <PageListItem pageKey="helps" onClick={() => handleNavigate('/helps')}>
              <ListItemIcon>
                <HelpOutlineIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.helps")} />
            </PageListItem>
            <PageListItem pageKey="settings" onClick={() => handleNavigate('/settings')}>
              <ListItemIcon>
                <SettingsOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.settings")} />
            </PageListItem>
          </List>
        </div>
      </Drawer>
    </>
  );
};

export default MobileNavigationMenu;
