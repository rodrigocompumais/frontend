import React, { useMemo } from "react";
import {
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  makeStyles,
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import useCompanyModules from "../../hooks/useCompanyModules";
import {
  PAGE_GROUP_ORDER,
  pageAccessToEffectiveSet,
  effectiveSetToPageAccess,
  filterPageDefinitionsByModules,
  isPageAvailableForModules,
} from "../../constants/pagePermissions";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  groupTitle: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
    fontWeight: 600,
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
  },
  hint: {
    marginBottom: theme.spacing(1),
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
  },
  checkboxRow: {
    marginLeft: 0,
  },
}));

const UserPagePermissionsEditor = ({
  profile,
  pageAccess,
  onChange,
  targetUserSuper = false,
}) => {
  const classes = useStyles();
  const { hasLanchonetes, hasAgendamento, loading: modulesLoading } =
    useCompanyModules();

  const moduleFlags = useMemo(
    () => ({ hasLanchonetes, hasAgendamento }),
    [hasLanchonetes, hasAgendamento]
  );

  const selectedSet = useMemo(
    () => pageAccessToEffectiveSet(pageAccess, moduleFlags),
    [pageAccess, moduleFlags]
  );

  const visiblePages = useMemo(
    () => filterPageDefinitionsByModules(moduleFlags),
    [moduleFlags]
  );

  if (profile !== "user" || modulesLoading) {
    return null;
  }

  const pagesByGroup = PAGE_GROUP_ORDER.map((group) => ({
    group,
    pages: visiblePages.filter((p) => {
      if (p.group !== group) return false;
      if (p.superOnly && !targetUserSuper) return false;
      return true;
    }),
  })).filter((g) => g.pages.length > 0);

  const handleToggle = (pageKey) => {
    const next = new Set(selectedSet);
    if (next.has(pageKey)) {
      next.delete(pageKey);
    } else if (isPageAvailableForModules(pageKey, moduleFlags)) {
      next.add(pageKey);
    }
    onChange(effectiveSetToPageAccess(next, moduleFlags));
  };

  return (
    <div className={classes.root}>
      <Divider />
      <Typography variant="subtitle1" style={{ marginTop: 16 }}>
        {i18n.t("userModal.pageAccess.title")}
      </Typography>
      <Typography className={classes.hint}>
        {i18n.t("userModal.pageAccess.hint")}
      </Typography>
      {!hasLanchonetes && (
        <Typography className={classes.hint}>
          {i18n.t("userModal.pageAccess.hintLanchonetesHidden")}
        </Typography>
      )}
      {pagesByGroup.map(({ group, pages }) => (
        <div key={group}>
          <Typography className={classes.groupTitle}>
            {i18n.t(`userModal.pageAccess.groups.${group}`)}
          </Typography>
          <FormGroup>
            {pages.map((page) => (
              <FormControlLabel
                key={page.key}
                className={classes.checkboxRow}
                control={
                  <Checkbox
                    color="primary"
                    checked={selectedSet.has(page.key)}
                    onChange={() => handleToggle(page.key)}
                  />
                }
                label={i18n.t(`userModal.pageAccess.pages.${page.key}`, {
                  defaultValue: page.key,
                })}
              />
            ))}
          </FormGroup>
        </div>
      ))}
    </div>
  );
};

export default UserPagePermissionsEditor;
