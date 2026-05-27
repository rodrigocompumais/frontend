import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Button,
  Menu,
  MenuItem,
  makeStyles,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@material-ui/core';
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
  Assignment as AssignmentIcon,
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
  HeadsetMic as HeadsetMicIcon,
  History as HistoryIcon,
  BusinessCenter as BusinessCenterIcon,
  Extension as ExtensionIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  ShoppingCart as ShoppingCartIcon,
  Restaurant as RestaurantIcon,
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
import useNotificationCounts from '../../hooks/useNotificationCounts';
import useInternalChatUnreadCount from '../../hooks/useInternalChatUnreadCount';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    marginLeft: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  menuButton: {
    color: 'white',
    textTransform: 'none',
    marginRight: theme.spacing(1),
    fontSize: '0.95rem',
    fontWeight: 500,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  menu: {
    marginTop: theme.spacing(1),
  },
  menuItem: {
    minWidth: 200,
    padding: theme.spacing(1.5, 2),
  },
  listItemIcon: {
    minWidth: 40,
    color: theme.palette.text.secondary,
  },
  divider: {
    margin: theme.spacing(1, 0),
  },
}));

const PageMenuItem = ({ pageKey, className, onClick, children }) => (
  <NavPageGate pageKey={pageKey}>
    <MenuItem className={className} onClick={onClick}>
      {children}
    </MenuItem>
  </NavPageGate>
);

const NavigationMenus = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { hasAnyPageAccess, canAccessPage } = usePageAccess();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { getPlanCompany } = usePlans();
  const { hasLanchonetes, hasAgendamento } = useCompanyModules();
  const { pendingTicketsCount, unreadMessagesCount, totalNotifications } = useNotificationCounts();
  const { unreadChatCount } = useInternalChatUnreadCount();

  // Estados para os dropdowns
  const [atendimentoAnchor, setAtendimentoAnchor] = useState(null);
  const [gestaoAnchor, setGestaoAnchor] = useState(null);
  const [automacaoAnchor, setAutomacaoAnchor] = useState(null);
  const [administracaoAnchor, setAdministracaoAnchor] = useState(null);
  const [sistemaAnchor, setSistemaAnchor] = useState(null);

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

  const handleNavigate = (path, closeMenu) => {
    history.push(path);
    closeMenu();
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
    <div className={classes.root}>
      {/* 1. ATENDIMENTO */}
      <div>
        <Button
          className={classes.menuButton}
          onClick={(e) => setAtendimentoAnchor(e.currentTarget)}
          startIcon={
            <Badge badgeContent={totalNotifications > 0 ? totalNotifications : 0} color="error" max={99}>
              <HeadsetMicIcon />
            </Badge>
          }
        >
          {i18n.t("navigation.atendimento")}
        </Button>
        <Menu
          anchorEl={atendimentoAnchor}
          open={Boolean(atendimentoAnchor)}
          onClose={() => setAtendimentoAnchor(null)}
          disablePortal
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          className={classes.menu}
        >
        <PageMenuItem
          pageKey="tickets"
          className={classes.menuItem}
          onClick={() => handleNavigate('/tickets', () => setAtendimentoAnchor(null))}
        >
          <ListItemIcon>
            <Badge 
              badgeContent={totalNotifications > 0 ? totalNotifications : 0} 
              color="error" 
              max={99}
            >
              <WhatsAppIcon fontSize="small" />
            </Badge>
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.tickets")} />
        </PageMenuItem>
        <PageMenuItem
          pageKey="tickets-finalizadas"
          className={classes.menuItem}
          onClick={() => handleNavigate('/tickets/finalizadas', () => setAtendimentoAnchor(null))}
        >
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.ticketsFinalizadas")} />
        </PageMenuItem>
        {showKanban && (
          <PageMenuItem
            pageKey="kanban"
            className={classes.menuItem}
            onClick={() => handleNavigate('/kanban', () => setAtendimentoAnchor(null))}
          >
            <ListItemIcon>
              <TableChartIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Kanban" />
          </PageMenuItem>
        )}
        {showInternalChat && (
          <PageMenuItem
            pageKey="chats"
            className={classes.menuItem}
            onClick={() => handleNavigate('/chats', () => setAtendimentoAnchor(null))}
          >
            <ListItemIcon>
              <Badge badgeContent={unreadChatCount > 0 ? unreadChatCount : 0} color="error" max={99}>
                <ForumIcon fontSize="small" />
              </Badge>
            </ListItemIcon>
            <ListItemText primary={i18n.t("mainDrawer.listItems.chats")} />
          </PageMenuItem>
        )}
        <PageMenuItem
          pageKey="quick-messages"
          className={classes.menuItem}
          onClick={() => handleNavigate('/quick-messages', () => setAtendimentoAnchor(null))}
        >
          <ListItemIcon>
            <FlashOnIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.quickMessages")} />
        </PageMenuItem>
        </Menu>
      </div>

      {/* 2. GESTÃO */}
      <div>
        <Button
          className={classes.menuButton}
          onClick={(e) => setGestaoAnchor(e.currentTarget)}
          startIcon={<BusinessCenterIcon />}
        >
          {i18n.t("navigation.gestao")}
        </Button>
        <Menu
          anchorEl={gestaoAnchor}
          open={Boolean(gestaoAnchor)}
          onClose={() => setGestaoAnchor(null)}
          disablePortal
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          className={classes.menu}
        >
        <PageMenuItem
          pageKey="todolist"
          className={classes.menuItem}
          onClick={() => handleNavigate('/todolist', () => setGestaoAnchor(null))}
        >
          <ListItemIcon>
            <BorderColorIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.tasks")} />
        </PageMenuItem>
        <PageMenuItem
          pageKey="schedules"
          className={classes.menuItem}
          onClick={() => handleNavigate('/schedules', () => setGestaoAnchor(null))}
        >
          <ListItemIcon>
            <EventIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.schedules")} />
        </PageMenuItem>
        <PageMenuItem
          pageKey="contacts"
          className={classes.menuItem}
          onClick={() => handleNavigate('/contacts', () => setGestaoAnchor(null))}
        >
          <ListItemIcon>
            <ContactPhoneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.contacts")} />
        </PageMenuItem>
        <PageMenuItem
          pageKey="tags"
          className={classes.menuItem}
          onClick={() => handleNavigate('/tags', () => setGestaoAnchor(null))}
        >
          <ListItemIcon>
            <LocalOfferIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.tags")} />
        </PageMenuItem>
        <PageMenuItem
          pageKey="forms"
          className={classes.menuItem}
          onClick={() => handleNavigate('/forms', () => setGestaoAnchor(null))}
        >
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.forms")} />
        </PageMenuItem>
        {hasLanchonetes && (
          <>
            <PageMenuItem
              pageKey="products"
              className={classes.menuItem}
              onClick={() => handleNavigate('/products', () => setGestaoAnchor(null))}
            >
              <ListItemIcon>
                <ShoppingCartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Produtos" />
            </PageMenuItem>
            <PageMenuItem
              pageKey="lanchonetes"
              className={classes.menuItem}
              onClick={() => handleNavigate('/lanchonetes', () => setGestaoAnchor(null))}
            >
              <ListItemIcon>
                <RestaurantIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={i18n.t("lanchonetes.hubName")} />
            </PageMenuItem>
            <PageMenuItem
              pageKey="pdv"
              className={classes.menuItem}
              onClick={() => handleNavigate('/pdv', () => setGestaoAnchor(null))}
            >
              <ListItemIcon>
                <ReceiptIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="PDV" />
            </PageMenuItem>
          </>
        )}
        {hasAgendamento && (
          <PageMenuItem
            pageKey="agendamento"
            className={classes.menuItem}
            onClick={() => handleNavigate('/agendamento', () => setGestaoAnchor(null))}
          >
            <ListItemIcon>
              <EventIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={i18n.t("agendamento.hubName")} />
          </PageMenuItem>
        )}
        </Menu>
      </div>

      {/* 3. AUTOMAÇÃO & IA */}
      {showAutomacaoMenu && (
        <>
          <div>
            <Button
              className={classes.menuButton}
              onClick={(e) => setAutomacaoAnchor(e.currentTarget)}
              startIcon={<ExtensionIcon />}
            >
              {i18n.t("navigation.automacaoIA")}
            </Button>
            <Menu
              anchorEl={automacaoAnchor}
              open={Boolean(automacaoAnchor)}
              onClose={() => setAutomacaoAnchor(null)}
              disablePortal
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              className={classes.menu}
            >
            {showCampaigns && (
              <>
                <PageMenuItem
                  pageKey="campaigns"
                  className={classes.menuItem}
                  onClick={() => handleNavigate('/campaigns', () => setAutomacaoAnchor(null))}
                >
                  <ListItemIcon>
                    <EventAvailableIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t("mainDrawer.listItems.campaigns")} />
                </PageMenuItem>
                <PageMenuItem
                  pageKey="contact-lists"
                  className={classes.menuItem}
                  onClick={() => handleNavigate('/contact-lists', () => setAutomacaoAnchor(null))}
                >
                  <ListItemIcon>
                    <PeopleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Listas de Contatos" />
                </PageMenuItem>
                <PageMenuItem
                  pageKey="flowbuilders"
                  className={classes.menuItem}
                  onClick={() => handleNavigate('/flowbuilders', () => setAutomacaoAnchor(null))}
                >
                  <ListItemIcon>
                    <AccountTreeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t("mainDrawer.listItems.flows")} />
                </PageMenuItem>
              </>
            )}
            {showOpenAi && (
              <PageMenuItem
                pageKey="prompts"
                className={classes.menuItem}
                onClick={() => handleNavigate('/prompts', () => setAutomacaoAnchor(null))}
              >
                <ListItemIcon>
                  <AllInclusiveIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.prompts")} />
              </PageMenuItem>
            )}
            </Menu>
          </div>
        </>
      )}

      {/* 4. ADMINISTRAÇÃO */}
      {showAdminSection && (
          <>
            <div>
              <Button
                className={classes.menuButton}
                onClick={(e) => setAdministracaoAnchor(e.currentTarget)}
                startIcon={<SecurityIcon />}
              >
                {i18n.t("navigation.administracao")}
              </Button>
              <Menu
                anchorEl={administracaoAnchor}
                open={Boolean(administracaoAnchor)}
                onClose={() => setAdministracaoAnchor(null)}
                disablePortal
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                className={classes.menu}
              >
              <PageMenuItem
                pageKey="users"
                className={classes.menuItem}
                onClick={() => handleNavigate('/users', () => setAdministracaoAnchor(null))}
              >
                <ListItemIcon>
                  <PeopleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.users")} />
              </PageMenuItem>
              <PageMenuItem
                pageKey="connections"
                className={classes.menuItem}
                onClick={() => handleNavigate('/connections', () => setAdministracaoAnchor(null))}
              >
                <ListItemIcon>
                  <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                    <SyncAltIcon fontSize="small" />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.connections")} />
              </PageMenuItem>
              <PageMenuItem
                pageKey="queues"
                className={classes.menuItem}
                onClick={() => handleNavigate('/queues', () => setAdministracaoAnchor(null))}
              >
                <ListItemIcon>
                  <AccountTreeOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.queues")} />
              </PageMenuItem>
              <PageMenuItem
                pageKey="files"
                className={classes.menuItem}
                onClick={() => handleNavigate('/files', () => setAdministracaoAnchor(null))}
              >
                <ListItemIcon>
                  <AttachFileIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.files")} />
              </PageMenuItem>
              {showIntegrations && (
                <PageMenuItem
                  pageKey="queue-integration"
                  className={classes.menuItem}
                  onClick={() => handleNavigate('/queue-integration', () => setAdministracaoAnchor(null))}
                >
                  <ListItemIcon>
                    <DeviceHubOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t("mainDrawer.listItems.queueIntegration")} />
                </PageMenuItem>
              )}
              {showExternalApi && (
                <PageMenuItem
                  pageKey="messages-api"
                  className={classes.menuItem}
                  onClick={() => handleNavigate('/messages-api', () => setAdministracaoAnchor(null))}
                >
                  <ListItemIcon>
                    <CodeRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t("mainDrawer.listItems.messagesAPI")} />
                </PageMenuItem>
              )}
              <PageMenuItem
                pageKey="financeiro"
                className={classes.menuItem}
                onClick={() => handleNavigate('/financeiro', () => setAdministracaoAnchor(null))}
              >
                <ListItemIcon>
                  <LocalAtmIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.financeiro")} />
              </PageMenuItem>
              {user.super && canAccessPage(user, "announcements") && (
                <Divider className={classes.divider} />
              )}
              {user.super && canAccessPage(user, "announcements") && (
                <PageMenuItem
                  pageKey="announcements"
                  className={classes.menuItem}
                  onClick={() => handleNavigate('/announcements', () => setAdministracaoAnchor(null))}
                >
                  <ListItemIcon>
                    <AnnouncementIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t("mainDrawer.listItems.annoucements")} />
                </PageMenuItem>
              )}
              </Menu>
            </div>
          </>
      )}

      {/* 5. SISTEMA */}
      <div>
        <Button
          className={classes.menuButton}
          onClick={(e) => setSistemaAnchor(e.currentTarget)}
          startIcon={<SettingsIcon />}
        >
          {i18n.t("navigation.sistema")}
        </Button>
        <Menu
          anchorEl={sistemaAnchor}
          open={Boolean(sistemaAnchor)}
          onClose={() => setSistemaAnchor(null)}
          disablePortal
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          className={classes.menu}
        >
        <PageMenuItem
          pageKey="helps"
          className={classes.menuItem}
          onClick={() => handleNavigate('/helps', () => setSistemaAnchor(null))}
        >
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.helps")} />
        </PageMenuItem>
        <PageMenuItem
          pageKey="settings"
          className={classes.menuItem}
          onClick={() => handleNavigate('/settings', () => setSistemaAnchor(null))}
        >
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.settings")} />
        </PageMenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default NavigationMenus;
