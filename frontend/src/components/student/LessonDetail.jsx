import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, ChevronRight, BookOpen, Video, Pencil } from "lucide-react";
import { studentService } from "../../services/studentService";

const LessonDetail = () => {
  const { lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseContent, setCourseContent] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const summaryRef = useRef(null);

  // Hàm lấy videoId từ URL YouTube
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    // Thử trích videoId từ nhiều dạng URL YouTube
    const regexList = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?&]+)/,
    ];

    for (const regex of regexList) {
      const match = url.match(regex);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  useEffect(() => {
    const fetchLessonDetail = async () => {
      try {
        setLoading(true);
        const response = await studentService.getLessonDetail(lessonId);
        setLesson(response.data);
        // Lấy nội dung khóa học (sections, lessons, quizzes) nếu có
        if (response.data.section && response.data.section.course_id) {
          const courseId = response.data.section.course_id;
          const courseRes = await studentService.getCourseDetail(courseId);
          setCourseContent(courseRes.data);
        } else {
          setCourseContent(null);
        }
      } catch (error) {
        console.error("Error fetching lesson:", error);

        if (error.response) {
          if (error.response.status === 403) {
            toast.error("Bạn chưa đăng ký khóa học này");
            navigate("/student/courses");
          } else if (error.response.status === 404) {
            toast.error("Không tìm thấy bài học");
            navigate("/student/my-courses");
          }
        } else {
          toast.error("Không thể tải nội dung bài học");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLessonDetail();
  }, [lessonId, navigate]);

  // Lấy quizId nếu đang ở trang quiz
  const quizId = location.pathname.includes("/student/quizzes/")
    ? location.pathname.split("/student/quizzes/")[1]
    : null;

  // Summarize handler
  const handleSummarize = async () => {
    setSummarizing(true);
    setSummary("");
    setSummaryError("");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 300000); // 5 phút
      const res = await studentService.summarizeLesson(lessonId, { signal: controller.signal });
      clearTimeout(timeout);
      setSummary(res.data.summary);
      setSummaryError("");
    } catch (err) {
      if (err?.response?.data?.detail) {
        setSummaryError(err.response.data.detail);
      } else if (err.name === "CanceledError" || err.name === "AbortError") {
        setSummaryError("Yêu cầu tóm tắt bị hủy do quá thời gian (timeout).");
      } else {
        setSummaryError("Đã xảy ra lỗi khi tóm tắt nội dung.");
      }
    } finally {
      setSummarizing(false);
    }
  };

  // Save summary to file
  const handleSaveFile = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tomtat_baihoc_${lessonId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Không tìm thấy bài học
        </h2>
        <Link
          to="/student/my-courses"
          className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <ArrowLeft size={16} className="mr-2" />
          Quay lại khóa học của tôi
        </Link>
      </div>
    );
  }

  // Lấy video ID
  const videoId = getYouTubeVideoId(lesson.video_url);

  return (
    <div className="space-y-8 md:flex md:space-y-0 md:space-x-8">
      <div className="flex-1 min-w-0 relative">
        {/* Floating Pencil Button (bottom right) */}
        <button
          className="fixed bottom-6 right-6 z-40 bg-indigo-600 text-white rounded-full p-3 shadow-xl hover:bg-indigo-700 focus:outline-none flex items-center justify-center"
          title="Tóm tắt bài học"
          style={{ boxShadow: '0 4px 24px 0 rgba(80,80,180,0.15)' }}
          onClick={() => setShowChat(true)}
        >
          <Pencil size={26} />
        </button>
        {/* Popup summary (fixed, taller, no drag/resize) */}
        {showChat && (
          <>
            {/* Backdrop for outside click */}
            <div
              className="fixed inset-0 z-40 "
              onClick={() => setShowChat(false)}
            />
            <div
              className="fixed z-50"
              style={{
                width: 420,
                height: 520,
                bottom: 90,
                right: 30,
                background: 'rgba(255,255,255,1)',
                borderRadius: '1rem',
                boxShadow: '0 8px 32px 0 rgba(80,80,180,0.18)',
                border: '1px solid #e0e7ef',
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div
                className="px-6 py-3 border-b border-gray-100 bg-indigo-50 dark:bg-slate-900 rounded-t-xl select-none flex items-center justify-between"
                style={{ userSelect: 'none' }}
              >
                <span className="text-lg font-bold text-indigo-700 dark:text-indigo-200">Trợ lý tóm tắt bài học</span>
                <button
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl ml-2"
                  onClick={() => setShowChat(false)}
                  title="Đóng"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  ×
                </button>
              </div>
              <div className="flex-1 p-6 overflow-auto flex flex-col">
                <textarea
                  ref={summaryRef}
                  className="w-full h-80 p-2 border rounded bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 mb-3"
                  value={summary}
                  readOnly
                  style={{ resize: 'none' }}
                />
                {summaryError && (
                  <div className="text-red-600 text-sm mb-2">{summaryError}</div>
                )}
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full disabled:opacity-60"
                    onClick={handleSummarize}
                    disabled={summarizing}
                  >
                    {summarizing ? "Đang tóm tắt..." : "Tóm tắt nội dung"}
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full"
                    onClick={handleSaveFile}
                    disabled={!summary}
                  >
                    Lưu file
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Breadcrumb */}
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/student/my-courses"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeft size={16} className="mr-2" />
                Khóa học của tôi
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                  Bài học
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
          {/* Video Player */}
          {videoId ? (
            <div className="aspect-video w-full bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={lesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Không có video để hiển thị
            </div>
          )}

          {/* Lesson Content */}
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {lesson.title}
              </h1>
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                {videoId ? (
                  <Video className="inline" size={18} />
                ) : (
                  <BookOpen className="inline" size={18} />
                )}
                <span className="text-sm">
                  {videoId ? "Video bài giảng" : "Bài đọc"}
                </span>
              </div>
            </div>

            <div className="prose max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: lesson.content }}></div>
            </div>
          </div>
        </div>
      </div>
      {/* Thanh nội dung khóa học bên phải */}
      {courseContent === null && (
        <aside className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 h-fit sticky top-8 max-h-[80vh] overflow-y-auto flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 text-center">Không thể tải nội dung khóa học (courseContent=null). Kiểm tra lại API lesson detail phải trả về section.course_id.</span>
        </aside>
      )}
      {courseContent && (
        <aside className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 h-fit sticky top-8 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
            Nội dung khóa học
          </h3>
          {/* Ngày cập nhật */}
          {courseContent.last_updated_at && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              <span className="font-medium">Ngày cập nhật:</span> {new Date(courseContent.last_updated_at).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          )}
          {courseContent.sections && courseContent.sections.length > 0 ? (
            <div className="space-y-4">
              {courseContent.sections.map((section) => (
                <div key={section.id}>
                  <div className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                    {section.title}
                  </div>
                  <ul className="space-y-1 ml-2">
                    {section.lessons &&
                      section.lessons.map((l) => (
                        <li key={l.id}>
                          <button
                            onClick={() => navigate(`/student/lessons/${l.id}`)}
                            className={`w-full text-left px-2 py-1 rounded transition-all ${
                              String(l.id) === String(lessonId) && !quizId
                                ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 font-bold"
                                : "hover:bg-indigo-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            <BookOpen className="inline mr-1" size={16} /> {l.title}
                          </button>
                        </li>
                      ))}
                  </ul>
                  {/* Hiển thị quiz của chương */}
                  {section.quizzes && section.quizzes.length > 0 && (
                    <div className="mt-2 mb-1">
                      <div className="text-xs font-medium text-blue-700 dark:text-blue-200 mb-1 pl-2">Bài kiểm tra</div>
                      <ul className="space-y-1 ml-4">
                        {section.quizzes.map((q) => (
                          <li key={q.id} className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/student/quizzes/${q.id}`)}
                              className={`flex-1 text-left px-2 py-1 rounded transition-all ${
                                String(q.id) === String(quizId)
                                  ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-bold"
                                  : "hover:bg-purple-50 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-200"
                              }`}
                            >
                              📝 {q.title}
                            </button>
                            <button
                              onClick={() => navigate(`/student/quizzes/${q.id}/history`)}
                              className="ml-2 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                            >
                              Xem lịch sử
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">Chưa có nội dung</div>
          )}
        </aside>
      )}
    </div>
  );
};

export default LessonDetail;
