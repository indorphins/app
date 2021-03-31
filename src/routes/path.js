const base = {
  home: "/",
  profile: "/profile",
  schedule: "/schedule",
  signup: "/signup",
  login: "/login",
  courses: "/class",
  instructor: "/instructor",
  milestone: '/milestones',
  instructors: '/instructors',
  admin: '/admin',
  referFriend: '/refer',
  addPayment: '/payment',
  reports: '/reports'
};

let params = Object.assign({}, base);
params.instructorProfile = base.instructor + "/:id";
params.courseDetail = base.courses + "/:id";
params.joinPath = "/join";
params.courseJoinSession = params.courseDetail + params.joinPath;

export default params;