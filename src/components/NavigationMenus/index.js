import React, { useState, useContext, useEffect, useRef } from 'react';
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
import { Can } from '../Can';
import { AuthContext } from '../../context/Auth/AuthContext';
import { WhatsAppsContext } from '../../context/WhatsApp/WhatsAppsContext';
import usePlans from '../../hooks/usePlans';
import useCompanyModules from '../../hooks/useCompanyModules';
import useNotificationCounts from '../../hooks/useNotificationCounts';

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

const NavigationMenus = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { whatsApps } = useContext(WhatsAppsContext);
  const { getPlanCompany } = usePlans();
  const { hasLanchonetes } = useCompanyModules();
  const { pendingTicketsCount, unreadMessagesCount, totalNotifications } = useNotificationCounts();

  // Estados para os dropdowns
  const [atendimentoAnchor, setAtendimentoAnchor] = useState(null);
  const [gestaoAnchor, setGestaoAnchor] = useState(null);
  const [automacaoAnchor, setAutomacaoAnchor] = useState(null);
  const [administracaoAnchor, setAdministracaoAnchor] = useState(null);
  const [sistemaAnchor, setSistemaAnchor] = useState(null);

  // Expandir ao passar o mouse: wrapper evita fechar ao mover do botão para o dropdown (disablePortal mantém menu no mesmo container)
  const closeTimerRef = useRef(null);
  const HOVER_CLOSE_DELAY = 280;
  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const openOnHover = (setAnchor, e) => {
    clearCloseTimer();
    setAnchor(e.currentTarget);
  };
  const scheduleClose = (setAnchor) => {
    closeTimerRef.current = setTimeout(() => setAnchor(null), HOVER_CLOSE_DELAY);
  };
  const wrapperStyle = { position: 'relative', display: 'inline-block' };

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

  const handleNavigate = (path, closeMenu) => {
    history.push(path);
    closeMenu();
  };

  return (
    <div className={classes.root}>
      {/* 1. ATENDIMENTO */}
      <div
        style={wrapperStyle}
        onMouseEnter={clearCloseTimer}
        onMouseLeave={() => scheduleClose(setAtendimentoAnchor)}
      >
        <Button
          className={classes.menuButton}
          onClick={(e) => setAtendimentoAnchor(e.currentTarget)}
          onMouseEnter={(e) => openOnHover(setAtendimentoAnchor, e)}
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
          onClose={() => { clearCloseTimer(); setAtendimentoAnchor(null); }}
          disablePortal
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          className={classes.menu}
          MenuListProps={{
            onMouseEnter: clearCloseTimer,
            onMouseLeave: () => scheduleClose(setAtendimentoAnchor),
          }}
        >
        <MenuItem
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
        </MenuItem>
        {showKanban && (
          <MenuItem
            className={classes.menuItem}
            onClick={() => handleNavigate('/kanban', () => setAtendimentoAnchor(null))}
          >
            <ListItemIcon>
              <TableChartIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Kanban" />
          </MenuItem>
        )}
        {showInternalChat && (
          <MenuItem
            className={classes.menuItem}
            onClick={() => handleNavigate('/chats', () => setAtendimentoAnchor(null))}
          >
            <ListItemIcon>
              <ForumIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={i18n.t("mainDrawer.listItems.chats")} />
          </MenuItem>
        )}
        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNavigate('/quick-messages', () => setAtendimentoAnchor(null))}
        >
          <ListItemIcon>
            <FlashOnIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.quickMessages")} />
        </MenuItem>
        </Menu>
      </div>

      {/* 2. GESTÃO */}
      <div
        style={wrapperStyle}
        onMouseEnter={clearCloseTimer}
        onMouseLeave={() => scheduleClose(setGestaoAnchor)}
      >
        <Button
          className={classes.menuButton}
          onClick={(e) => setGestaoAnchor(e.currentTarget)}
          onMouseEnter={(e) => openOnHover(setGestaoAnchor, e)}
          startIcon={<BusinessCenterIcon />}
        >
          {i18n.t("navigation.gestao")}
        </Button>
        <Menu
          anchorEl={gestaoAnchor}
          open={Boolean(gestaoAnchor)}
          onClose={() => { clearCloseTimer(); setGestaoAnchor(null); }}
          disablePortal
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          className={classes.menu}
          MenuListProps={{
            onMouseEnter: clearCloseTimer,
            onMouseLeave: () => scheduleClose(setGestaoAnchor),
          }}
        >
        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNavigate('/todolist', () => setGestaoAnchor(null))}
        >
          <ListItemIcon>
            <BorderColorIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.tasks")} />
        </MenuItem>
        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNavigate('/schedules', () => setGestaoAnchor(null))}
        >
          <ListItemIcon>
            <EventIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.schedules")} />
        </MenuItem>
        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNavigate('/contacts', () => setGestaoAnchor(null))}
        >
          <ListItemIcon>
            <ContactPhoneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.contacts")} />
        </MenuItem>
        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNavigate('/tags', () => setGestaoAnchor(null))}
        >
          <ListItemIcon>
            <LocalOfferIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.tags")} />
        </MenuItem>
        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNavigate('/forms', () => setGestaoAnchor(null))}
        >
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.forms")} />
        </MenuItem>
        {hasLanchonetes && (
          <>
            <MenuItem
              className={classes.menuItem}
              onClick={() => handleNavigate('/products', () => setGestaoAnchor(null))}
            >
              <ListItemIcon>
                <ShoppingCartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Produtos" />
            </MenuItem>
            <MenuItem
              className={classes.menuItem}
              onClick={() => handleNavigate('/lanchonetes', () => setGestaoAnchor(null))}
            >
              <ListItemIcon>
                <RestaurantIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={i18n.t("lanchonetes.hubName")} />
            </MenuItem>
            <MenuItem
              className={classes.menuItem}
              onClick={() => handleNavigate('/pdv', () => setGestaoAnchor(null))}
            >
              <ListItemIcon>
                <ReceiptIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="PDV" />
            </MenuItem>
          </>
        )}
        </Menu>
      </div>

      {/* 3. AUTOMAÇÃO & IA */}
      {(showCampaigns || showOpenAi) && (
        <>
          <div
            style={wrapperStyle}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={() => scheduleClose(setAutomacaoAnchor)}
          >
            <Button
              className={classes.menuButton}
              onClick={(e) => setAutomacaoAnchor(e.currentTarget)}
              onMouseEnter={(e) => openOnHover(setAutomacaoAnchor, e)}
              startIcon={<ExtensionIcon />}
            >
              {i18n.t("navigation.automacaoIA")}
            </Button>
            <Menu
              anchorEl={automacaoAnchor}
              open={Boolean(automacaoAnchor)}
              onClose={() => { clearCloseTimer(); setAutomacaoAnchor(null); }}
              disablePortal
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              className={classes.menu}
              MenuListProps={{
                onMouseEnter: clearCloseTimer,
                onMouseLeave: () => scheduleClose(setAutomacaoAnchor),
              }}
            >
            {showCampaigns && (
              <>
                <MenuItem
                  className={classes.menuItem}
                  onClick={() => handleNavigate('/campaigns', () => setAutomacaoAnchor(null))}
                >
                  <ListItemIcon>
                    <EventAvailableIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t("mainDrawer.listItems.campaigns")} />
                </MenuItem>
                <MenuItem
                  className={classes.menuItem}
                  onClick={() => handleNavigate('/contact-lists', () => setAutomacaoAnchor(null))}
                >
                  <ListItemIcon>
                    <PeopleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Listas de Contatos" />
                </MenuItem>
                <MenuItem
                  className={classes.menuItem}
                  onClick={() => handleNavigate('/flowbuilders', () => setAutomacaoAnchor(null))}
                >
                  <ListItemIcon>
                    <AccountTreeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t("mainDrawer.listItems.flows")} />
                </MenuItem>
              </>
            )}
            {showOpenAi && (
              <MenuItem
                className={classes.menuItem}
                onClick={() => handleNavigate('/prompts', () => setAutomacaoAnchor(null))}
              >
                <ListItemIcon>
                  <AllInclusiveIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.prompts")} />
              </MenuItem>
            )}
            </Menu>
          </div>
        </>
      )}

      {/* 4. ADMINISTRAÇÃO */}
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <div
              style={wrapperStyle}
              onMouseEnter={clearCloseTimer}
              onMouseLeave={() => scheduleClose(setAdministracaoAnchor)}
            >
              <Button
                className={classes.menuButton}
                onClick={(e) => setAdministracaoAnchor(e.currentTarget)}
                onMouseEnter={(e) => openOnHover(setAdministracaoAnchor, e)}
                startIcon={<SecurityIcon />}
              >
                {i18n.t("navigation.administracao")}
              </Button>
              <Menu
                anchorEl={administracaoAnchor}
                open={Boolean(administracaoAnchor)}
                onClose={() => { clearCloseTimer(); setAdministracaoAnchor(null); }}
                disablePortal
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                className={classes.menu}
                MenuListProps={{
                  onMouseEnter: clearCloseTimer,
                  onMouseLeave: () => scheduleClose(setAdministracaoAnchor),
                }}
              >
              <MenuItem
                className={classes.menuItem}
                onClick={() => handleNavigate('/users', () => setAdministracaoAnchor(null))}
              >
                <ListItemIcon>
                  <PeopleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.users")} />
              </MenuItem>
              <MenuItem
                className={classes.menuItem}
                onClick={() => handleNavigate('/connections', () => setAdministracaoAnchor(null))}
              >
                <ListItemIcon>
                  <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                    <SyncAltIcon fontSize="small" />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.connections")} />
              </MenuItem>
              <MenuItem
                className={classes.menuItem}
                onClick={() => handleNavigate('/queues', () => setAdministracaoAnchor(null))}
              >
                <ListItemIcon>
                  <AccountTreeOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.queues")} />
              </MenuItem>
              <MenuItem
                className={classes.menuItem}
                onClick={() => handleNavigate('/files', () => setAdministracaoAnchor(null))}
              >
                <ListItemIcon>
                  <AttachFileIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.files")} />
              </MenuItem>
              {showIntegrations && (
                <MenuItem
                  className={classes.menuItem}
                  onClick={() => handleNavigate('/queue-integration', () => setAdministracaoAnchor(null))}
                >
                  <ListItemIcon>
                    <DeviceHubOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t("mainDrawer.listItems.queueIntegration")} />
                </MenuItem>
              )}
              {showExternalApi && (
                <MenuItem
                  className={classes.menuItem}
                  onClick={() => handleNavigate('/messages-api', () => setAdministracaoAnchor(null))}
                >
                  <ListItemIcon>
                    <CodeRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t("mainDrawer.listItems.messagesAPI")} />
                </MenuItem>
              )}
              <MenuItem
                className={classes.menuItem}
                onClick={() => handleNavigate('/financeiro', () => setAdministracaoAnchor(null))}
              >
                <ListItemIcon>
                  <LocalAtmIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={i18n.t("mainDrawer.listItems.financeiro")} />
              </MenuItem>
              {user.super && (
                <Divider className={classes.divider} />
              )}
              {user.super && (
                <MenuItem
                  className={classes.menuItem}
                  onClick={() => handleNavigate('/announcements', () => setAdministracaoAnchor(null))}
                >
                  <ListItemIcon>
                    <AnnouncementIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t("mainDrawer.listItems.annoucements")} />
                </MenuItem>
              )}
              </Menu>
            </div>
          </>
        )}
      />

      {/* 5. SISTEMA */}
      <div
        style={wrapperStyle}
        onMouseEnter={clearCloseTimer}
        onMouseLeave={() => scheduleClose(setSistemaAnchor)}
      >
        <Button
          className={classes.menuButton}
          onClick={(e) => setSistemaAnchor(e.currentTarget)}
          onMouseEnter={(e) => openOnHover(setSistemaAnchor, e)}
          startIcon={<SettingsIcon />}
        >
          {i18n.t("navigation.sistema")}
        </Button>
        <Menu
          anchorEl={sistemaAnchor}
          open={Boolean(sistemaAnchor)}
          onClose={() => { clearCloseTimer(); setSistemaAnchor(null); }}
          disablePortal
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          className={classes.menu}
          MenuListProps={{
            onMouseEnter: clearCloseTimer,
            onMouseLeave: () => scheduleClose(setSistemaAnchor),
          }}
        >
        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNavigate('/helps', () => setSistemaAnchor(null))}
        >
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.listItems.helps")} />
        </MenuItem>
        <Can
          role={user.profile}
          perform="drawer-admin-items:view"
          yes={() => (
            <MenuItem
              className={classes.menuItem}
              onClick={() => handleNavigate('/settings', () => setSistemaAnchor(null))}
            >
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={i18n.t("mainDrawer.listItems.settings")} />
            </MenuItem>
          )}
        />
        </Menu>
      </div>
    </div>
  );
};

export default NavigationMenus;
