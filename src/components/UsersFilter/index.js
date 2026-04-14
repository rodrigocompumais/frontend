import { Box, Chip, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

function normalizeUserIds(initialUsers) {
  if (!Array.isArray(initialUsers) || initialUsers.length === 0) return [];
  return initialUsers
    .map((x) => {
      if (x != null && typeof x === "object") return Number(x.id);
      return Number(x);
    })
    .filter((id) => !Number.isNaN(id));
}

export function UsersFilter({ onFiltered, initialUsers }) {
  const [users, setUsers] = useState([]);
  const [selecteds, setSelecteds] = useState([]);

  useEffect(() => {
    async function fetchData() {
      await loadUsers();
    }
    fetchData();
  }, []);

  // Sincroniza seleção quando o pai envia IDs (não chama onFiltered — evita loop e valores undefined no .id)
  useEffect(() => {
    if (initialUsers === undefined) return;
    if (!Array.isArray(users) || users.length === 0) return;
    const ids = normalizeUserIds(initialUsers);
    if (ids.length === 0) {
      setSelecteds([]);
      return;
    }
    const resolved = ids
      .map((id) => users.find((u) => Number(u.id) === id))
      .filter(Boolean);
    setSelecteds(resolved);
  }, [initialUsers, users]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get(`/users/list`);
      const userList = data.map((u) => ({ id: u.id, name: u.name }));
      setUsers(userList);
    } catch (err) {
      toastError(err);
    }
  };

  const onChange = (value) => {
    const next = value || [];
    setSelecteds(next);
    onFiltered(next);
  };

  return (
    <Box style={{ padding: "0px 10px 10px" }}>
      <Autocomplete
        multiple
        size="small"
        options={users}
        value={selecteds}
        onChange={(e, v) => onChange(v)}
        getOptionLabel={(option) => (option && option.name) || ""}
        getOptionSelected={(option, value) => {
          return (
            option?.id === value?.id ||
            (option?.name &&
              value?.name &&
              option.name.toLowerCase() === value.name.toLowerCase())
          );
        }}
        renderTags={(value, getUserProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              style={{
                backgroundColor: "#bfbfbf",
                textShadow: "1px 1px 1px #000",
                color: "white",
              }}
              label={option?.name || ""}
              {...getUserProps({ index })}
              size="small"
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={i18n.t("tickets.filters.user")}
          />
        )}
      />
    </Box>
  );
}
