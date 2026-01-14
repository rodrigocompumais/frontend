import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Box,
  Divider,
} from '@material-ui/core';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Message as MessageIcon,
  PersonAdd as PersonAddIcon,
} from '@material-ui/icons';
import { parseVCard } from '../../utils/vcardParser';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { i18n } from '../../translate/i18n';

const useStyles = makeStyles((theme) => ({
  contactCard: {
    maxWidth: 320,
    margin: theme.spacing(1, 0),
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  avatar: {
    width: 56,
    height: 56,
    marginRight: theme.spacing(1.5),
    backgroundColor: theme.palette.primary.main,
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  contactInfo: {
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    fontWeight: 600,
    fontSize: '1rem',
    color: '#202020',
    marginBottom: theme.spacing(0.5),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  contactOrg: {
    fontSize: '0.85rem',
    color: '#666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardContent: {
    padding: theme.spacing(1, 2),
    paddingTop: 0,
  },
  contactDetail: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.75, 0),
    fontSize: '0.9rem',
    color: '#333',
  },
  contactDetailIcon: {
    marginRight: theme.spacing(1.5),
    color: '#666',
    fontSize: '1.1rem',
  },
  contactDetailText: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  divider: {
    margin: theme.spacing(1, 0),
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2, 2, 2),
  },
  actionButton: {
    flex: 1,
    textTransform: 'none',
    borderRadius: 20,
    padding: theme.spacing(0.75, 2),
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  messageButton: {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  addButton: {
    backgroundColor: '#e0e0e0',
    color: '#333',
    '&:hover': {
      backgroundColor: '#d0d0d0',
    },
  },
}));

const ContactCard = ({ vcardString, ticketId, onContactAdded }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  
  const contact = parseVCard(vcardString);
  
  if (!contact) {
    return null;
  }

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Format Brazilian numbers
    if (cleaned.startsWith('+55')) {
      cleaned = cleaned.substring(3);
      if (cleaned.length === 11) {
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
      } else if (cleaned.length === 10) {
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
      }
    }
    
    return phone;
  };

  const handleSendMessage = async () => {
    if (!contact.phones.length) {
      toast.error('Contato não possui número de telefone');
      return;
    }
    
    setLoading(true);
    try {
      const phoneNumber = contact.phones[0].number.replace(/[^\d]/g, '');
      
      // Search for existing contact
      const { data: contactsData } = await api.get('/contacts', {
        params: { searchParam: phoneNumber }
      });

      let contactId = null;
      
      if (contactsData?.contacts?.length > 0) {
        contactId = contactsData.contacts[0].id;
      } else {
        // Create contact if doesn't exist
        try {
          const contactData = {
            name: contact.name,
            number: phoneNumber,
            email: contact.emails[0] || '',
          };
          const { data: newContact } = await api.post('/contacts', contactData);
          contactId = newContact.id;
        } catch (err) {
          console.error('Erro ao criar contato:', err);
        }
      }

      // Navigate to tickets page with search for this contact
      if (contactId) {
        history.push(`/tickets?contactId=${contactId}`);
      } else {
        history.push(`/tickets?search=${encodeURIComponent(phoneNumber)}`);
      }
    } catch (error) {
      console.error('Erro ao abrir conversa:', error);
      toast.error('Erro ao abrir conversa');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!contact.phones.length) {
      toast.error('Contato não possui número de telefone');
      return;
    }

    setLoading(true);
    try {
      const phoneNumber = contact.phones[0].number.replace(/[^\d]/g, '');
      
      // Check if contact already exists
      const { data: existingContacts } = await api.get('/contacts', {
        params: { searchParam: phoneNumber }
      });

      if (existingContacts?.contacts?.length > 0) {
        toast.info('Contato já existe na sua lista');
        if (onContactAdded) {
          onContactAdded(existingContacts.contacts[0]);
        }
        return;
      }

      // Create new contact
      const contactData = {
        name: contact.name,
        number: phoneNumber,
        email: contact.emails[0] || '',
      };

      const { data: newContact } = await api.post('/contacts', contactData);
      
      toast.success('Contato adicionado com sucesso!');
      if (onContactAdded) {
        onContactAdded(newContact);
      }
    } catch (error) {
      console.error('Erro ao adicionar contato:', error);
      toast.error('Erro ao adicionar contato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={classes.contactCard}>
      <Box className={classes.cardHeader}>
        <Avatar 
          src={contact.photo} 
          className={classes.avatar}
          alt={contact.name}
        >
          {!contact.photo && getInitials(contact.name)}
        </Avatar>
        <Box className={classes.contactInfo}>
          <Typography className={classes.contactName}>
            {contact.name || 'Contato'}
          </Typography>
          {contact.organization && (
            <Typography className={classes.contactOrg}>
              {contact.organization}
            </Typography>
          )}
        </Box>
      </Box>

      <CardContent className={classes.cardContent}>
        {contact.phones.length > 0 && (
          <Box className={classes.contactDetail}>
            <PhoneIcon className={classes.contactDetailIcon} />
            <Typography className={classes.contactDetailText}>
              {formatPhoneNumber(contact.phones[0].number)}
              {contact.phones[0].type && ` (${contact.phones[0].type})`}
            </Typography>
          </Box>
        )}

        {contact.phones.length > 1 && (
          <Box className={classes.contactDetail}>
            <PhoneIcon className={classes.contactDetailIcon} />
            <Typography className={classes.contactDetailText}>
              {formatPhoneNumber(contact.phones[1].number)}
              {contact.phones[1].type && ` (${contact.phones[1].type})`}
            </Typography>
          </Box>
        )}

        {contact.emails.length > 0 && (
          <Box className={classes.contactDetail}>
            <EmailIcon className={classes.contactDetailIcon} />
            <Typography className={classes.contactDetailText}>
              {contact.emails[0]}
            </Typography>
          </Box>
        )}
      </CardContent>

      <Divider className={classes.divider} />

      <Box className={classes.actionButtons}>
        {contact.phones.length > 0 && (
          <Button
            className={`${classes.actionButton} ${classes.messageButton}`}
            startIcon={<MessageIcon />}
            onClick={handleSendMessage}
            disabled={loading}
            variant="contained"
          >
            {i18n.t('contactCard.sendMessage') || 'Conversar'}
          </Button>
        )}
        <Button
          className={`${classes.actionButton} ${classes.addButton}`}
          startIcon={<PersonAddIcon />}
          onClick={handleAddContact}
          disabled={loading}
          variant="contained"
        >
          {i18n.t('contactCard.addContact') || 'Adicionar'}
        </Button>
      </Box>
    </Card>
  );
};

export default ContactCard;
