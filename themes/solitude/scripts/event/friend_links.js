"use strict";

const getFriendLinksMeta = (hexo) => {
  const linksData = hexo.locals.get("data")?.links;
  const groups = Array.isArray(linksData?.links) ? linksData.links : [];
  const total = groups.reduce(
    (count, group) =>
      count + (Array.isArray(group?.link_list) ? group.link_list.length : 0),
    0
  );
  const configuredThreshold = Number(
    hexo.theme.config.page?.links?.async_threshold
  );
  const threshold =
    Number.isInteger(configuredThreshold) && configuredThreshold >= 0
      ? configuredThreshold
      : 200;

  return { linksData, total, async: total > threshold };
};

hexo.extend.generator.register("friend-links-data", function () {
  const meta = getFriendLinksMeta(this);
  if (!meta.linksData || meta.total === 0) return;

  return {
    path: "links.json",
    data: JSON.stringify({ ...meta.linksData, total: meta.total }),
  };
});
