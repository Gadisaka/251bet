/**
 * Single full-bleed column at every breakpoint: the desktop view is the mobile
 * page stretched wide, with the bet slip reachable from the pinned bottom bar
 * instead of a sidebar.
 */
function MainLayout({ center }) {
  return (
    <div className="flex w-full min-w-0 flex-col bg-(--sb-bg-page)">{center}</div>
  );
}

export default MainLayout;
