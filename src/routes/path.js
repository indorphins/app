const base = {
  home: "/",
  profile: "/profile",
  signup: "/signup",
  login: "/login",
  courses: "/class",
};

let params = Object.assign({}, base);
params.instructorProfile = base.profile + "/:id";
params.courseDetail = base.courses + "/:id";
params.joinPath = "/join";
params.courseJoinSession = params.courseDetail + params.joinPath;

export default params;