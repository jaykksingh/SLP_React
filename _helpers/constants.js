
export const BaseUrl = "https://pre-api.stafflinepro.com/v7/api/"; //Staging
export const BaseURLElastic = "https://rs.iendorseu.com/_a/"; //Staging
export const WebBaseURL = "https://pre.stafflinepro.com/"; //Staging
export const LeaveMgrBaseURL = "https://stafflineapi-beta.compunnel.com/"; //Staging
export const ChatBotHistory = 'https://pre.stafflinepro.com/chatWebHook/lg.php'; //Staging
export const ChatBotSendMessage = "https://pre.stafflinepro.com/chatWebHook/gl.php"; //Staging


// export const BaseUrl = "https://api.stafflinepro.com/v7/api/"; //Production
// export const BaseURLElastic = "http://rs.iendorseu.com/search/_a/"; //Production
// export const WebBaseURL = "http://app.stafflinepro.com/"; //Production
// export const LeaveMgrBaseURL = "https://stafflineapi.compunnel.com/"; //Production
// export const ChatBotHistory = "https://pre.stafflinepro.com/chatWebHook/lg.php"; //Production
// export const ChatBotSendMessage = "https://app.stafflinepro.com/chatWebHook/gl.php"; //Production



export const EndPoints = {
  
  LoginEndPoint: "accounts/signin",
  ForgotPasswordEndPoint: "accounts/forgotpassword",
  ChangePassword:'accounts/changepassword',
  SignUpUserEndPoint : "accounts/signup",
  UserProfile : "users",
  UserLookups:'users/lookupdata',
  SubDomains:'users/getsubdomain/',
  OtherInformation:'users/getOtherInformation/',
  DashboardSummary:'summary/jobsactivities',
  JobStatistics: "jobs/statistics",
  LocationSearch:"regions/location/search",
  CountryEndPoint:'regions/country',
  StateEndPint:'regions/state/',
  CityEndPint:'regions/city/',
  JobApplicationCount:"jobs/application-count",
  ReferJob:'jobs/referjob',
  CheckJobAlreadyRefer:'jobs/checkjobrefer',
  ApplyJob:'jobs/apply',
  NotFit:'jobs/notfit',
  JobAlert:'jobs/alert',
  ScreeningQuestion:'prescreening/check',
  ScreeningQuestionSave:'prescreening/save',
  JobApplications:'jobs/applications',
  CurrentProjectsList:'myprojects/currentprojects',
  PastProjectList:'myprojects/pastprojects',
  ProjectLookups:'myprojects/lookupdata',
  MyProjectUpdate:'myprojects',
  GetProjectHours:'timecards/getprojecthours',
  GetTimehsstes:'timecards/timesheet',
  GetTimesheetHours:'timecards/hours',
  SaveTimesheetHours:'timecards/savehours',
  UploadClientTimesheet:'timecards/client',
  ApproveClientTimesheet : 'timecards/approveclient',
  ClockInout:'timecards/clock-inout',
  UpdateClockInOut:'timecards/update-clock-inout',
  DeleteClockInOut:'timecards/remove',
  PayrollStatusList:'timecards/payroll',
  GetVacationList:'vacations',
  VacationTypes:'myprojects/vacation',
  ExpensesList:'expenses',
  PayrollInfo :"payrolls/info",
  PayrollCalendar :"payrolls/calendar",
  TimehssetPDF :'timecards/createpdf',
  ChatGroups:'chat/groups',
  IssueTypeList:'chat/getissuetype/',
  StartConversation:'chat/startconversations',
  ProjectEndDate:'myprojects/projectend',
  NotificationsList:'settings/message',
  ConversationsList:'chat/conversations',
  MessageList:'chat/getmessage',
  SendMessage:'chat/send',
  ChatFeedback:'chat/feedback',
  ReferarContact:'referrals',
  InviteViaEmail:'jobs/invitevaimail',
  ReferClient:'referrals/client',
  InvitationList:'jobs/invitations',
  JobReferredList:'jobs/refer',
  InterviewList:'jobs/scheduledinterviewslist',
  NewsList:'news',
  LegalFilingList:'immigrationapplications',
  ImmigrationDetails:'immigrationapplications',
  LegalDocumentsList:'immigrationapplications/documents',
  LCAList:'lca',
  LegalFilingLookup:'immigrationapplications/lookup/data',
  LegalFilingDocList:'immigrationdocuments',
  HrBenefits:'benefits',
  HrBenefitsList:'benefit/all',
  InterviewTips:'interviewtips',
  FormsList:'forms',
  HolidayScheduleList:'holidays/schedule',
  ReportABug:'reportabug',
  SupportContact:'support-contacts',
  AlertSettingLookup:'settings/lookupdata',
  AlertSetting:'settings/alert',
  MyLeavesList:'leaves',
  LeaveLookUp:'leaves/balance',
  LeaveRequst:'leave/request',
  LeaveApprove:'leave/bulkapprove',
  LeaveReject:'leave/bulkreject',
  LeaveCancel:'leave/cancelrequest',
  LeavePullBack:'leave/pullback',
  AttendanceCalender:'API_StafflinePro/GetAttendanceCalender',
  AttendanceDetails:'attendance/detail',
  Myregularization:'regularization/myregularization',
  RegularizationStatusUpdate : "regularization/updatestatus",
  RegularizationStatusCancel : "regularization/cancelrequest",
  RegularizationBulkUpdateStatus:'regularization/bulkupdatestatus',
  GetRegularizationLookup : "regularization/lookup",
  RegularizationRequest:'regularization/request',
  LeavesActionPending:'leaves/action-pending',
  TeamRegularizationList:'regularization/teamregularization',
  SaveChatHistory:'chat/savehistory',
  Offerletter:'employee/offerletter',
  EOBAttachment:'employee/attachment',
  DocumentUpload:'employee/uploadattachment',

  
}


export const StaticMessage = {
  
  AppName:'StafflinePro™',
  UnknownErrorMsg : "We encountered some problem. Please try again.",
  NoResumeSelected:"Please select a resume to apply.",
  SessionExpired: "Session expired. Please login again.",
  MannualEntryAlert:'If you do not have a client approved timesheet, you can enter hours manually and upload your timesheet later.',
  SelectProjectAlert:'Please select project',
  NoInternetMessage : "You may be offline. Check your internet connection and try again",
  FileSizeExcedMsg : "The file you are uploading exceeds the 2 MB limit",
  FileSize5MbExcedMsg : "The file you are uploading exceeds the 5 MB limit",

}
export const FontName = {
  Regular:'Helvetica',
  Italic:'Helvetica-Oblique',
  Bold:'Helvetica-Bold'

}

export const ThemeColor = {
  NavColor:'#00649E',
  SkyBlueColor:'#E2F4FA',
  BtnColor:'#559535',
  BtnGrayColor:'#9A9A9A',
  SwitchInactiveColor:'#E9E9EB',
  BorderColor:'#DADBDD',
  SubHeaderColor:'#F3F3F3',
  InputBorderColor:'#CCCCCC',
  HelpingTextColor:'#555555',
  ViewBgColor:'#E5E9EB',
  TextColor:'#333333',
  SubTextColor:'#444444',
  LabelTextColor:'gray',
  RedColor:'#DB2100',
  GreenColor:'#27967E',
  OrangeColor:'#ED8C32',
  YellowColor:'#FCC438',
  BtnGrayBg:'#9A9A9A',
  TagColcor:'#95C1E5',
  PlaceHolderColor:'#C7C7CD',
  ActionSheetTitleColor:'black',
  dissableDateColor:'gray',


}

export const PAGE = {
  ITEM_PER_PAGE : 10
}

export const FILETYPE = {
  TYPE_RESUME : "1702",
  TYPE_DOC : "1701"
}


export const MessageGroupId = {
    GeneralQueriesID : 1,
    ImmigrationSupportID : 2,
    PayrollSupportID : 3,
    JobSupportID : 4,
    MyRecruiterID : 5,
    TimesheetSupportID : 6
}
