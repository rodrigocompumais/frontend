import React, { useMemo, useCallback } from "react";
import {
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Box,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";
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
  scrollArea: {
    maxHeight: 320,
    overflowY: "auto",
    marginTop: theme.spacing(1),
    paddingRight: theme.spacing(0.5),
    ...theme.scrollbarStyles,
  },
  groupTitle: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
    fontWeight: 600,
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
  },
  checkboxRow: {
    marginLeft: 0,
  },
  loadingBox: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(2, 0),
  },
}));

const UserPagePermissionsEditor = ({
  profile,
  pageAccess,
  onChange,
  targetUserSuper = false,
  moduleFlags,
  modulesLoading = false,
}) => {
  const classes = useStyles();

  const selectedSet = useMemo(
    () => pageAccessToEffectiveSet(pageAccess, moduleFlags),
    [pageAccess, moduleFlags]
  );

  const visiblePages = useMemo(
    () => filterPageDefinitionsByModules(moduleFlags),
    [moduleFlags]
  );

  const pagesByGroup = useMemo(
    () =>
      PAGE_GROUP_ORDER.map((group) => ({
        group,
        pages: visiblePages.filter((p) => {
          if (p.group !== group) return false;
          if (p.superOnly && !targetUserSuper) return false;
          return true;
        }),
      })).filter((g) => g.pages.length > 0),
    [visiblePages, targetUserSuper]
  );

  const handleToggle = useCallback(
    (pageKey) => {
      const next = new Set(selectedSet);
      if (next.has(pageKey)) {
        next.delete(pageKey);
      } else if (isPageAvailableForModules(pageKey, moduleFlags)) {
        next.add(pageKey);
      }
      onChange(effectiveSetToPageAccess(next, moduleFlags));
    },
    [selectedSet, moduleFlags, onChange]
  );

  if (profile !== "user") {
    return null;
  }

  return (
    <div className={classes.root}>
      <Divider />
      <Typography variant="subtitle1" style={{ marginTop: 16 }}>
        {i18n.t("userModal.pageAccess.title")}
      </Typography>
      <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>
        {i18n.t("userModal.pageAccess.hint")}
      </Typography>

      {modulesLoading ? (
        <Box className={classes.loadingBox}>
          <CircularProgress size={22} />
          <Typography variant="body2" color="textSecondary">
            {i18n.t("userModal.pageAccess.loading")}
          </Typography>
        </Box>
      ) : (
        <div className={classes.scrollArea}>
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
      )}
    </div>
  );
};

export default UserPagePermissionsEditor;
