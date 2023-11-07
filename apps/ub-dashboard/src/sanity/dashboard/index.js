import {
  projectUsersWidget,
  projectInfoWidget,
} from "@sanity/dashboard";
import { documentListWidget } from "sanity-plugin-dashboard-widget-document-list";

export const dashboardConfig = {
  widgets: [
    documentListWidget({
      title: 'Recently edited',
      order: '_updatedAt desc',
      limit: 10,
      layout: { width: 'small' },
    }),
    projectUsersWidget({ layout: 'medium' }),
    projectInfoWidget(),
  ],
}
