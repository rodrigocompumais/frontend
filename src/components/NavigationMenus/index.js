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
  Dashboard as DashboardIcon,
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
} from '@material-ui/icons';
import { Badge } from '@material-ui/core';
import { i18n } from '../../translate/i18n';
import { Can } from '../Can';
import { AuthContext } from '../../context/Auth/AuthContext';
import { WhatsAppsContext } from '../../context/WhatsApp/WhatsAppsContext';
import usePlans from '../../hooks/usePlans';
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
    color: '#FFFFFF',
    textTransform: 'none',
    marginRight: theme.spacing(2),
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
  const { pendingTicketsCount, unreadMessagesCount, totalNotifications } = useNotificationCounts();

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
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        className={classes.menu}
      >
        <Can
          role={user.profile}
          perform="dashboard:view"
          yes={() => (
            <MenuItem
              className={classes.menuItem}
              onClick={() => handleNavigate('/', () => setAtendimentoAnchor(null))}
            >
              <ListItemIcon>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </MenuItem>
          )}
        />
        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNavigate('/tickets', () => setAtendimentoAnchor(null))}
        >
          <ListItemIcon>
            <Badge 
              badgeContent={pendingTicketsCount + unreadMessagesCount > 0 ? pendingTicketsCount + unreadMessagesCount : 0} 
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

      {/* 2. GESTÃO */}
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
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        className={classes.menu}
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
      </Menu>

      {/* 3. AUTOMAÇÃO & IA */}
      {(showCampaigns || showOpenAi) && (
        <>
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
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            className={classes.menu}
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
        </>
      )}

      {/* 4. ADMINISTRAÇÃO */}
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
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
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              className={classes.menu}
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
                <>
                  <Divider className={classes.divider} />
                  <MenuItem
                    className={classes.menuItem}
                    onClick={() => handleNavigate('/announcements', () => setAdministracaoAnchor(null))}
                  >
                    <ListItemIcon>
                      <AnnouncementIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={i18n.t("mainDrawer.listItems.annoucements")} />
                  </MenuItem>
                </>
              )}
            </Menu>
          </>
        )}
      />

      {/* 5. SISTEMA */}
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
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        className={classes.menu}
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
  );
};

export default NavigationMenus;
