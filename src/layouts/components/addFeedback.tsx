import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, StarBorder } from "@mui/icons-material";
import './../../theme/styles/feedbackPageStyles.css'

interface Feedback {
  courseCode: string; 
  difficultyRating: number; 
  teachingQualityRating: number; 
  communicationSkillsRating: number; 
  review: string; 
}

type Course = {
    courseId: number;
    courseName: string;
    courseNumber: string;
    collegeId: number;
    professorId: number;
  };

const FeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState<Feedback>({
    courseCode: "",
    difficultyRating: 0, 
    teachingQualityRating: 0, 
    communicationSkillsRating: 0, 
    review: "",
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get('http://localhost:8090/courses')
      .then((response) => {
        console.log('Courses fetched:', response.data);
        setCourses(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeedback((prev) => ({
      ...prev,
      [name]: name === "courseCode" ? value : value, 
    }));
  };

  const [teachingQualityRating, setTeachingQualityRating] = useState<number>(0);
  const [difficultyRating, setDifficultyRating] = useState<number>(0);
  const [communicationRating, setCommunicationRating] = useState<number>(0);

  const handleStarClick = (category: string, rating: number) => {
    setFeedback(prevState => ({
      ...prevState,
      [category]: rating // updates only the specified rating category
    }));
  };  

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const feedbackData = [
      { categoryId: 1, rating: feedback.teachingQualityRating, review: feedback.review, courseId: feedback.courseCode },
      { categoryId: 2, rating: feedback.difficultyRating, review: feedback.review, courseId: feedback.courseCode },
      { categoryId: 3, rating: feedback.communicationSkillsRating, review: feedback.review, courseId: feedback.courseCode }
    ];

    try {
      for (const feedbackItem of feedbackData) {
        await axios.post('http://localhost:8090/feedbacks/add', {
          professorId: "1", // harcoded for now
          courseId: 106,  // hardcoded for now
          userId: "1",  //hardcoded for now
          categoryId: feedbackItem.categoryId,
          rating: feedbackItem.rating,
          edited: false,
          deleted: false,
          description: feedbackItem.review
        });
      }

      const overallRating = ((feedback.difficultyRating + feedback.teachingQualityRating + feedback.communicationSkillsRating) / 3).toFixed(2);

      await axios.post("http://localhost:8090/ratings/add", {
        professorId: "1", // hardcoded for now
        courseId: 106,  //hardcoded for now
        userId: "1", // hardcoded for now
        collegeId: "3", // hardcoded for now
        overallRating: overallRating, 
      });

      setFeedback({
        courseCode: "",
        difficultyRating: 0,
        teachingQualityRating: 0,
        communicationSkillsRating: 0,
        review: "",
      });

      // Success message
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(error);
    }
  };

  return (
    <div className="feedback-page">
      <h1>Provide Feedback</h1>
      <form onSubmit={handleSubmit}>
        <div className="card">
          {/* Course Code Dropdown */}
          <label htmlFor="courseCode">Select Course Code</label>
          <select
            id="courseCode"
            name="courseCode"
            value={feedback.courseCode}
            onChange={handleChange}
          >
            <option value="">-- Select Course --</option>
            {/* {courses.map((course) => (
              <option key={course.courseId} value={course.courseNumber}>
                {course.courseNumber}
              </option>
            ))} */}
            {!loading ? (
              courses.map((course) => (
                <option key={course.courseId} value={course.courseNumber}>
                  {course.courseNumber}
                </option>
              ))
            ) : (
              <option value="" disabled>Loading...</option>
            )}
          </select>
        </div>

        {/* Star Rating Sections */}
        <div className="card">
            <label>How difficult was the professor?</label>
            <div style={{ display: "flex", gap: "5px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} onClick={() => handleStarClick("difficultyRating", star)} style={{ cursor: "pointer" }}>
                {feedback.difficultyRating >= star ? (
                    <Star style={{ color: "#ffb400" }} />
                ) : (
                <StarBorder />
                )}
                </span>
                ))}
            </div>
        </div>

        <div className="card">
            <label>How was the teaching quality of the professor?</label>
            <div style={{ display: "flex", gap: "5px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} onClick={() => handleStarClick("teachingQualityRating", star)} style={{ cursor: "pointer" }}>
                {feedback.teachingQualityRating >= star ? (
                <Star style={{ color: "#ffb400" }} />
                ) : (
                <StarBorder />
                )}
                </span>
                ))}
            </div>
        </div>

        <div className="card">
            <label>How were the communication skills of the professor?</label>
            <div style={{ display: "flex", gap: "5px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} onClick={() => handleStarClick("communicationSkillsRating", star)} style={{ cursor: "pointer" }}>
                {feedback.communicationSkillsRating >= star ? (
                    <Star style={{ color: "#ffb400" }} />
                ) : (
                <StarBorder />
                )}
                </span>
                ))}
            </div>
        </div>

        <div className="card">
          {/* Review */}
          <label htmlFor="review">Write a Review:</label>
          <textarea
            id="review"
            name="review"
            value={feedback.review}
            onChange={handleChange}
            placeholder="Write Your Review"
          />
        </div>

        <div className="card">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackPage;
