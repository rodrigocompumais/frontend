const NOPICTURE = "/nopicture.png";

export const resolveContactAvatarSrc = (profilePicUrl) => {
  if (!profilePicUrl || String(profilePicUrl).includes("nopicture")) {
    return NOPICTURE;
  }
  if (
    profilePicUrl.includes("pps.whatsapp.net") ||
    profilePicUrl.includes("mmg.whatsapp.net")
  ) {
    return NOPICTURE;
  }
  return profilePicUrl;
};

export const handleContactAvatarError = (event) => {
  const target = event?.currentTarget || event?.target;
  if (!target || target.dataset?.avatarFallback === "1") return;
  target.dataset.avatarFallback = "1";
  target.onerror = null;
  target.src = NOPICTURE;
};

export const hasRealContactAvatar = (profilePicUrl) =>
  resolveContactAvatarSrc(profilePicUrl) !== NOPICTURE;

export const withAvatarCacheBust = (profilePicUrl, version) => {
  const src = resolveContactAvatarSrc(profilePicUrl);
  if (src === NOPICTURE || !version) {
    return src;
  }
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}v=${version}`;
};
