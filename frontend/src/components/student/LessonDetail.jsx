import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, ChevronRight, BookOpen, Video } from "lucide-react";
import { studentService } from "../../services/studentService";

const LessonDetail = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessonDetail = async () => {
      try {
        setLoading(true);
        const response = await studentService.getLessonDetail(lessonId);
        setLesson(response.data);
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

  return (
    <div className="space-y-8">
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
        {lesson.video_url && (
          <div className="aspect-video w-full bg-black">
            <iframe
              className="w-full h-full"
              src={lesson.video_url}
              title={lesson.title}
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Lesson Content */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {lesson.title}
            </h1>
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              {lesson.video_url ? (
                <Video className="inline" size={18} />
              ) : (
                <BookOpen className="inline" size={18} />
              )}
              <span className="text-sm">
                {lesson.video_url ? "Video bài giảng" : "Bài đọc"}
              </span>
            </div>
          </div>

          <div className="prose max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
