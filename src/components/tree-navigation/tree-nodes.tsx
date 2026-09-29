import { TreeExpander, TreeIcon, TreeLabel, TreeNode, TreeNodeContent, TreeNodeTrigger } from '@/components/ui/tree';
import type { SidebarRoute } from '@/config/routes';

export function renderTreeNodes(routes: SidebarRoute[], onNavigate: (path: string) => void, level = 0, parentPath: boolean[] = []) {
  return routes.map((route, index) => {
    const children = route.children;
    const hasChildren = !!children && children.length > 0;
    const isLast = index === routes.length - 1;

    const nextParentPath = [...parentPath];
    if (level > 0) {
      nextParentPath[level - 1] = isLast;
    }

    return (
      <TreeNode key={route.id} nodeId={route.id} level={level} isLast={isLast} parentPath={parentPath}>
        <TreeNodeTrigger
          onClick={(e) => {
            if (!hasChildren) {
              e.preventDefault();
              onNavigate(route.path);
            }
          }}
        >
          <TreeExpander hasChildren={hasChildren} />
          {route.icon && <TreeIcon icon={<route.icon className="size-4" />} hasChildren={hasChildren} />}
          <TreeLabel>{route.labelKey}</TreeLabel>
        </TreeNodeTrigger>
        {hasChildren && <TreeNodeContent hasChildren>{renderTreeNodes(children, onNavigate, level + 1, nextParentPath)}</TreeNodeContent>}
      </TreeNode>
    );
  });
}
