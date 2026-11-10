// مساعد معلمتي - Teacher's Assistant


// =====================================
// EMY - Teacher's Assistant
// =====================================
let currentAnalysisExamId = null;
// إظهار شاشة إعداد الامتحان
function showExamSetup() {
    const examSetup = document.getElementById("exam-setup");

    examSetup.style.display = "block";

    examSetup.scrollIntoView({
        behavior: "smooth"
    });
}
function showAnalysis() {
    document.getElementById("exam-setup").style.display = "none";
    document.getElementById("student-entry-area").innerHTML = "";

    const analysisArea = document.getElementById("analysis-area");
    analysisArea.style.display = "block";

    renderAnalysisExams();

    if (currentAnalysisExamId) {
        analyzeExam(currentAnalysisExamId);
    }

    analysisArea.scrollIntoView({
        behavior: "smooth"
    });
}
// إنشاء خانات الأسئلة
// إنشاء أسئلة الامتحان
function createQuestions() {
    const count = Number(
        document.getElementById("question-count").value
    );

    const questionsArea = document.getElementById("questions-area");

    questionsArea.innerHTML = "";

    if (!Number.isInteger(count) || count < 1 || count > 100) {
        alert("يرجى إدخال عدد صحيح للأسئلة من 1 إلى 100.");
        return;
    }

    for (let i = 1; i <= count; i++) {
        questionsArea.innerHTML += `
            <div class="question-item">
                <h3>السؤال ${i}</h3>

                <label>العلامة القصوى</label>
                <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    class="max-mark"
                    placeholder="مثلاً: 5"
                >

                <label>المهارة (اختياري)</label>
                <select class="question-skill">
                    <option value="">بدون تصنيف</option>
                    <option value="Grammar">القواعد (Grammar)</option>
                    <option value="Vocabulary">المفردات (Vocabulary)</option>
                    <option value="Reading">القراءة (Reading)</option>
                    <option value="Writing">الكتابة (Writing)</option>
                    <option value="Translation">الترجمة (Translation)</option>
                    <option value="Listening">الاستماع (Listening)</option>
                    <option value="Speaking">المحادثة (Speaking)</option>
                </select>
            </div>
        `;
    }

    questionsArea.innerHTML += `
        <h3 id="total-mark">مجموع العلامات القصوى: 0</h3>

        <button onclick="startGrading()">
            اعتماد الأسئلة والبدء بالتصحيح
        </button>
    `;

    document.querySelectorAll(".max-mark").forEach(input => {
        input.addEventListener("input", calculateExamTotal);
    });
}


// حساب مجموع العلامات القصوى
function calculateExamTotal() {
    const inputs = document.querySelectorAll(".max-mark");
    let total = 0;

    inputs.forEach(input => {
        const value = Number(input.value);

        if (input.value !== "" && value > 0) {
            total += value;
        }
    });

    document.getElementById("total-mark").textContent =
        "مجموع العلامات القصوى: " + total;
}


// التحقق من الأسئلة والانتقال للتصحيح
function startGrading() {
    const maxInputs = document.querySelectorAll(".max-mark");
    const skillInputs = document.querySelectorAll(".question-skill");

    const examName = document.getElementById("exam-name").value.trim();
    const examClass = document.getElementById("exam-class").value.trim();
    const examDate = document.getElementById("exam-date").value;

    if (!examName || !examClass) {
        alert("يرجى إدخال اسم الامتحان والصف والشعبة.");
        return;
    }

    const questions = [];

    for (let i = 0; i < maxInputs.length; i++) {
        const max = Number(maxInputs[i].value);

        if (maxInputs[i].value === "" || max <= 0) {
            alert("يرجى إدخال العلامة القصوى لكل سؤال.");
            maxInputs[i].focus();
            return;
        }

        questions.push({
            number: i + 1,
            maxMark: max,
            skill: skillInputs[i].value
        });
    }

    currentExam = {
        id: Date.now(),
        name: examName,
        className: examClass,
        date: examDate,
        questions: questions,
        students: [],
        status: "قيد التصحيح",
        currentStudentIndex: 0
    };

    currentStudentIndex = 0;

    saveCurrentExam();

    showStudentForm();
    loadStudentQuestions();

    document.getElementById("student-entry-area").scrollIntoView({
        behavior: "smooth"
    });
}
    

// حساب العلامات والتحقق منها
function calculateTotal() {
    const maxInputs = document.querySelectorAll(".max-mark");
    const markInputs = document.querySelectorAll(".question-mark");
    const errors = document.querySelectorAll(".question-error");

    let maxTotal = 0;
    let studentTotal = 0;

    maxInputs.forEach((input, index) => {
        const max = Number(input.value);
        const mark = markInputs[index].value;
        const error = errors[index];

        error.textContent = "";

        if (input.value === "" || max <= 0) {
            error.textContent = "أدخلي علامة قصوى صحيحة.";
            input.style.borderColor = "red";
            return;
        }

        input.style.borderColor = "";

        maxTotal += max;

        if (mark !== "") {
            const studentMark = Number(mark);

            if (
                studentMark < 0 ||
                studentMark > max
            ) {
                error.textContent =
                    "العلامة يجب أن تكون بين 0 و " + max;

                markInputs[index].style.borderColor = "red";
                return;
            }

            markInputs[index].style.borderColor = "";
            studentTotal += studentMark;
        }
    });

    document.getElementById("total-mark").textContent =
        "مجموع العلامات القصوى: " + maxTotal;

    document.getElementById("student-total").textContent =
        "مجموع علامات الطالبة: " + studentTotal;
}
// =====================================
// نظام حفظ بيانات EMY
// =====================================

// جميع الامتحانات المحفوظة
let exams = JSON.parse(
    localStorage.getItem("emyExams") || "[]"
);

// الامتحان الذي تعمل عليه المعلمة حاليًا
let currentExam = null;

// رقم الطالبة الحالية
let currentStudentIndex = 0;
let editingStudentIndex = null;

// حفظ قائمة الامتحانات
function saveExams() {
    localStorage.setItem(
        "emyExams",
        JSON.stringify(exams)
    );
}


// حفظ الامتحان الحالي
function saveCurrentExam() {
    if (!currentExam) {
        return;
    }

    const index = exams.findIndex(
        exam => exam.id === currentExam.id
    );

    if (index === -1) {
        exams.push(currentExam);
    } else {
        exams[index] = currentExam;
    }

    saveExams();
}

// عرض نموذج إدخال الطالبة
// عرض نموذج إدخال الطالبة
// عرض نموذج إدخال الطالبة
function showStudentForm() {
    const area = document.getElementById("student-entry-area");

    editingStudentIndex = null;

    const studentNumber = currentExam.students.length + 1;

    area.innerHTML = `
        <h2>تصحيح الامتحان</h2>

        <p>الامتحان: ${currentExam.name}</p>

        <p>الصف والشعبة: ${currentExam.className}</p>

        <p>عدد الأسئلة: ${currentExam.questions.length}</p>

        <h3 id="student-form-title">الطالبة رقم ${studentNumber}</h3>

        <label>اسم الطالبة</label>
        <input
            type="text"
            id="student-name"
            placeholder="أدخلي اسم الطالبة"
        >

        <h3>علامات الأسئلة وأسباب الإخفاق</h3>

        <div id="student-questions"></div>

        <button onclick="saveStudent()">
            حفظ والانتقال للطالبة التالية
        </button>

        <button onclick="finishGrading()">
            إنهاء التصحيح
        </button>

        <div class="question-item">
            <h3>الطالبات المحفوظات</h3>
            <div id="saved-students-list"></div>
        </div>
    `;

    renderSavedStudents();
}
// تجهيز أسئلة الطالبة
// تجهيز أسئلة الطالبة
function loadStudentQuestions() {
    const area = document.getElementById("student-questions");

    area.innerHTML = "";

    currentExam.questions.forEach((question, index) => {
        area.innerHTML += `
            <div class="question-item">
                <h3>السؤال ${question.number}</h3>

                <p>العلامة القصوى: ${question.maxMark}</p>

                <p>المهارة: ${question.skill || "غير مصنفة"}</p>

                <label>علامة الطالبة</label>
                <input
                    type="number"
                    min="0"
                    max="${question.maxMark}"
                    step="0.5"
                    class="student-question-mark"
                    data-question="${index}"
                    placeholder="أدخلي العلامة"
                    oninput="calculateStudentResults()"
                >

                <p class="question-percentage"></p>

                <label>أسباب الإخفاق</label>

                <div class="failure-reasons">
                    <label>
                        <input type="checkbox" class="failure-reason" value="عدم فهم القاعدة">
                        عدم فهم القاعدة
                    </label>

                    <label>
                        <input type="checkbox" class="failure-reason" value="ضعف المفردات">
                        ضعف المفردات
                    </label>

                    <label>
                        <input type="checkbox" class="failure-reason" value="عدم فهم المطلوب من السؤال">
                        عدم فهم المطلوب من السؤال
                    </label>

                    <label>
                        <input type="checkbox" class="failure-reason" value="عدم التركيز">
                        عدم التركيز
                    </label>

                    <label>
                        <input type="checkbox" class="failure-reason" value="خطأ في تطبيق القاعدة">
                        خطأ في تطبيق القاعدة
                    </label>

                    <label>
                        <input type="checkbox" class="failure-reason" value="ضعف مهارة القراءة">
                        ضعف مهارة القراءة
                    </label>

                    <label>
                        <input type="checkbox" class="failure-reason" value="ضيق الوقت">
                        ضيق الوقت
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            class="failure-reason other-reason-toggle"
                            value="أسباب أخرى"
                            onchange="toggleOtherReason(this)"
                        >
                        أسباب أخرى
                    </label>

                    <div class="other-reason-box" style="display:none;">
                        <label>اكتبي السبب الآخر</label>
                        <textarea
                            class="other-reason-text"
                            placeholder="اكتبي السبب هنا..."
                        ></textarea>
                    </div>
                </div>
            </div>
        `;
    });

    area.innerHTML += `
        <div class="question-item">
            <h3>نتيجة الطالبة</h3>
            <p id="student-total">مجموع العلامات: 0</p>
            <p id="student-percentage">نسبة التحصيل: 0%</p>
            <p id="student-failure-percentage">نسبة الإخفاق: 0%</p>
        </div>
    `;
}


// إظهار وإخفاء خانة الأسباب الأخرى
function toggleOtherReason(checkbox) {
    const question = checkbox.closest(".question-item");
    const box = question.querySelector(".other-reason-box");

    box.style.display = checkbox.checked ? "block" : "none";
}
// عرض أسماء الطالبات المحفوظات
function renderSavedStudents() {
    const area = document.getElementById("saved-students-list");

    if (!area) return;

    area.innerHTML = "";

    if (currentExam.students.length === 0) {
        area.textContent = "لا توجد طالبات محفوظات حتى الآن.";
        return;
    }

    currentExam.students.forEach((student, index) => {
        const button = document.createElement("button");

        button.textContent = "تعديل بيانات: " + student.name;

        button.onclick = function () {
            editStudent(index);
        };

        area.appendChild(button);
    });
}

// فتح بيانات طالبة محفوظة للتعديل
function editStudent(index) {
    const student = currentExam.students[index];

    if (!student) return;

    showStudentForm();
    loadStudentQuestions();

    editingStudentIndex = index;

    document.getElementById("student-name").value = student.name;

    document.getElementById("student-form-title").textContent =
        "تعديل بيانات الطالبة: " + student.name;

    const marks = document.querySelectorAll(".student-question-mark");

    marks.forEach((input, questionIndex) => {
        const savedQuestion = student.questions[questionIndex];

        if (!savedQuestion) return;

        input.value = savedQuestion.mark;

        const questionBox = input.closest(".question-item");

        const checkboxes =
            questionBox.querySelectorAll(".failure-reason");

        checkboxes.forEach(checkbox => {
            checkbox.checked =
                (savedQuestion.reasons || []).includes(checkbox.value);
        });

        const otherToggle =
            questionBox.querySelector(".other-reason-toggle");

        const otherBox =
            questionBox.querySelector(".other-reason-box");

        const otherText =
            questionBox.querySelector(".other-reason-text");

        otherText.value = savedQuestion.otherReason || "";

        otherBox.style.display =
            otherToggle.checked ? "block" : "none";
    });

    calculateStudentResults();

    document.getElementById("student-entry-area").scrollIntoView({
        behavior: "smooth"
    });
}
// حساب نتائج الطالبة تلقائيًا
function calculateStudentResults() {
    const marks = document.querySelectorAll(".student-question-mark");

    let studentTotal = 0;
    let maxTotal = 0;
    let completedQuestions = 0;

    marks.forEach((input, index) => {
        const question = currentExam.questions[index];
        const max = question.maxMark;
        const percentageArea = input
            .closest(".question-item")
            .querySelector(".question-percentage");

        maxTotal += max;

        if (input.value === "") {
            percentageArea.textContent = "بانتظار إدخال العلامة";
            return;
        }

        const mark = Number(input.value);

        if (!Number.isFinite(mark) || mark < 0 || mark > max) {
            percentageArea.textContent =
                "العلامة يجب أن تكون بين 0 و " + max;
            input.style.borderColor = "red";
            return;
        }

        input.style.borderColor = "";

        const achievement = (mark / max) * 100;
        const failure = 100 - achievement;

        studentTotal += mark;
        completedQuestions++;

        percentageArea.textContent =
            "التحصيل: " + achievement.toFixed(1) +
            "% | الإخفاق: " + failure.toFixed(1) + "%";
    });

    document.getElementById("student-total").textContent =
        "مجموع العلامات: " + studentTotal + " / " + maxTotal;

    const percentageArea =
        document.getElementById("student-percentage");

    const failureArea =
        document.getElementById("student-failure-percentage");

    if (completedQuestions !== marks.length) {
        percentageArea.textContent =
            "نسبة التحصيل: بانتظار استكمال العلامات (" +
            completedQuestions + " من " + marks.length + ")";

        failureArea.textContent =
            "نسبة الإخفاق: لم تكتمل العلامات بعد";

        return;
    }

    const totalPercentage = (studentTotal / maxTotal) * 100;

    percentageArea.textContent =
        "نسبة التحصيل: " + totalPercentage.toFixed(1) + "%";

    failureArea.textContent =
        "نسبة الإخفاق: " + (100 - totalPercentage).toFixed(1) + "%";
}
// حفظ بيانات الطالبة والانتقال للتالية
// حفظ بيانات الطالبة أو حفظ التعديلات
function saveStudent() {
    const name = document.getElementById("student-name").value.trim();

    if (!name) {
        alert("يرجى إدخال اسم الطالبة.");
        return;
    }

    const marks = document.querySelectorAll(".student-question-mark");

    const questionResults = [];
    let studentTotal = 0;
    let maxTotal = 0;

    for (let i = 0; i < marks.length; i++) {
        const input = marks[i];
        const question = currentExam.questions[i];

        if (input.value === "") {
            alert("يرجى إدخال علامة السؤال " + (i + 1));
            input.focus();
            return;
        }

        const mark = Number(input.value);

        if (!Number.isFinite(mark) || mark < 0 || mark > question.maxMark) {
            alert("علامة السؤال " + (i + 1) + " غير صحيحة.");
            input.focus();
            return;
        }

        const questionBox = input.closest(".question-item");

        const reasons = Array.from(
            questionBox.querySelectorAll(".failure-reason:checked")
        ).map(reason => reason.value);

        const otherReason = questionBox
            .querySelector(".other-reason-text").value.trim();

        const achievement = question.maxMark > 0
            ? (mark / question.maxMark) * 100
            : 0;

        questionResults.push({
            questionNumber: question.number,
            maxMark: question.maxMark,
            skill: question.skill,
            mark: mark,
            achievementPercentage: achievement,
            failurePercentage: 100 - achievement,
            reasons: reasons,
            otherReason: otherReason
        });

        studentTotal += mark;
        maxTotal += question.maxMark;
    }

    const student = {
        name: name,
        questions: questionResults,
        totalMark: studentTotal,
        maxTotal: maxTotal,
        percentage: maxTotal > 0
            ? (studentTotal / maxTotal) * 100
            : 0,
        failurePercentage: maxTotal > 0
            ? 100 - (studentTotal / maxTotal) * 100
            : 0
    };

    const wasEditing = editingStudentIndex !== null;

    if (wasEditing) {
        currentExam.students[editingStudentIndex] = student;
    } else {
        currentExam.students.push(student);
    }

    saveCurrentExam();
    renderSavedExams();

    editingStudentIndex = null;

    if (currentAnalysisExamId === currentExam.id) {
        analyzeExam(currentExam.id);
    }

    if (wasEditing) {
        alert("تم تعديل بيانات الطالبة وحفظ التغييرات بنجاح.");
    } else {
        alert("تم حفظ بيانات الطالبة بنجاح.");
    }

    showStudentForm();
    loadStudentQuestions();
}
// إنهاء جلسة التصحيح مع الاحتفاظ بالتقدم
function finishGrading() {
    if (!currentExam) {
        return;
    }

    const nameInput = document.getElementById("student-name");
    const markInputs = document.querySelectorAll(".student-question-mark");

    const hasUnsavedData =
        nameInput.value.trim() !== "" ||
        Array.from(markInputs).some(input => input.value !== "");

    if (hasUnsavedData) {
        alert("لديك بيانات طالبة لم تُحفظ بعد. احفظيها أولًا أو أكملي إدخالها.");
        return;
    }

    currentExam.status = "قيد التصحيح";

    saveCurrentExam();

    const area = document.getElementById("student-entry-area");

    area.innerHTML = `
        <div class="message-card">
            <h2>تم حفظ تقدم التصحيح</h2>

            <p>الامتحان: ${currentExam.name}</p>

            <p>عدد الطالبات المحفوظات: ${currentExam.students.length}</p>

            <p>حالة الامتحان: قيد التصحيح</p>

            <button onclick="resumeCurrentExam()">
                استكمال التصحيح
            </button>
        </div>
    `;
}


// استكمال التصحيح في الجلسة الحالية
function resumeCurrentExam() {
    if (!currentExam) {
        return;
    }

    currentExam.status = "قيد التصحيح";
    saveCurrentExam();

    showStudentForm();
    loadStudentQuestions();

    document.getElementById("student-entry-area").scrollIntoView({
        behavior: "smooth"
    });
}
// عرض قائمة الامتحانات المحفوظة
function renderSavedExams() {
    const area = document.getElementById("saved-exams-list");

    area.innerHTML = "";

    if (exams.length === 0) {
        area.textContent = "لا توجد امتحانات محفوظة حاليًا.";
        return;
    }

    exams.forEach(exam => {
        const card = document.createElement("div");
        card.className = "question-item";

        const title = document.createElement("h3");
        title.textContent = exam.name;

        const classInfo = document.createElement("p");
        classInfo.textContent = "الصف والشعبة: " + exam.className;

        const studentInfo = document.createElement("p");
        studentInfo.textContent =
            "عدد الطالبات المحفوظات: " + exam.students.length;

        const status = document.createElement("p");
        status.textContent =
            "الحالة: " + exam.status;

        const button = document.createElement("button");
        button.textContent = "استكمال التصحيح";

        button.onclick = function () {
            openSavedExam(exam.id);
        };

        card.appendChild(title);
        card.appendChild(classInfo);
        card.appendChild(studentInfo);
        card.appendChild(status);
        card.appendChild(button);

        area.appendChild(card);
    });
}

function renderAnalysisExams() {
    const area = document.getElementById("analysis-exams-list");

    area.innerHTML = "";

    if (exams.length === 0) {
        area.textContent = "لا توجد امتحانات محفوظة لتحليلها حاليًا.";
        return;
    }

    exams.forEach(exam => {
        const button = document.createElement("button");

        button.textContent =
            "تحليل امتحان: " + exam.name +
            " - " + exam.className;

        button.onclick = function () {
            analyzeExam(exam.id);
        };

        area.appendChild(button);
    });
}

function analyzeExam(examId) {
    const exam = exams.find(item => item.id === examId);

    if (!exam) {
        alert("لم يتم العثور على الامتحان.");
        return;
    }

    currentAnalysisExamId = examId;

    const resultsArea = document.getElementById("analysis-results");
    resultsArea.innerHTML = "";

    const students = exam.students || [];

    if (students.length === 0) {
        resultsArea.textContent = "لا توجد طالبات محفوظات في هذا الامتحان.";
        return;
    }

    const maxTotal = exam.questions.reduce(
        (sum, question) => sum + Number(question.maxMark), 0
    );

    const passingMark = maxTotal / 2;

    const successful = students.filter(
        student => student.totalMark >= passingMark
    ).length;

    const failed = students.length - successful;

    const average = students.reduce(
        (sum, student) => sum + Number(student.totalMark), 0
    ) / students.length;

    const achievement = maxTotal > 0
        ? (average / maxTotal) * 100
        : 0;

    resultsArea.innerHTML = `
        <h2>نتائج التحليل: ${exam.name}</h2>

        <p>الصف والشعبة: ${exam.className}</p>
        <p>عدد الطالبات: ${students.length}</p>
        <p>العلامة الكلية: ${maxTotal}</p>
        <p>علامة النجاح: ${passingMark}</p>
        <p>متوسط العلامات: ${average.toFixed(2)}</p>
        <p>نسبة التحصيل العامة: ${achievement.toFixed(2)}%</p>

        <h3>نتائج النجاح والإخفاق</h3>
        <p>عدد الناجحات: ${successful}</p>
        <p>عدد غير الناجحات: ${failed}</p>
        <p>نسبة النجاح: ${(successful / students.length * 100).toFixed(2)}%</p>
        <p>نسبة الإخفاق: ${(failed / students.length * 100).toFixed(2)}%</p>
    `;

    renderQuestionAnalysis(exam, resultsArea);
    renderFailureAnalysis(exam, resultsArea);
}

function renderQuestionAnalysis(exam, resultsArea) {
    const students = exam.students || [];

    let questions = [];
    let skills = {};

    exam.questions.forEach((question, index) => {
        let totalMarks = 0;
        let totalMaxMarks = 0;

        students.forEach(student => {
            const result = student.questions?.[index];

            if (result) {
                totalMarks += Number(result.mark) || 0;
                totalMaxMarks += Number(result.maxMark) || 0;
            }
        });

        const percentage = totalMaxMarks > 0
            ? (totalMarks / totalMaxMarks) * 100
            : 0;

        questions.push({
            number: question.number,
            skill: question.skill || "غير محددة",
            totalMarks,
            totalMaxMarks,
            percentage
        });

        const skillName = question.skill?.trim();

        if (skillName) {
            if (!skills[skillName]) {
                skills[skillName] = {
                    totalMarks: 0,
                    totalMaxMarks: 0
                };
            }

            skills[skillName].totalMarks += totalMarks;
            skills[skillName].totalMaxMarks += totalMaxMarks;
        }
    });

    // ترتيب الأسئلة من الأعلى تحصيلًا إلى الأقل
    questions.sort((a, b) => b.percentage - a.percentage);

    let questionsHTML = `
        <h3>تحليل أداء الطالبات في كل سؤال</h3>
    `;

    questions.forEach(question => {
        questionsHTML += `
            <div class="question-item">
                <h4>السؤال ${question.number}</h4>
                <p>المهارة: ${question.skill}</p>
                <p>مجموع علامات الطالبات: ${question.totalMarks}</p>
                <p>مجموع العلامات القصوى: ${question.totalMaxMarks}</p>
                <p>نسبة التحصيل: ${question.percentage.toFixed(2)}%</p>
            </div>
        `;
    });

    resultsArea.innerHTML += questionsHTML;

    // حساب نسب التحصيل لكل مهارة
    const sortedSkills = Object.entries(skills).map(([name, data]) => ({
        name,
        totalMarks: data.totalMarks,
        totalMaxMarks: data.totalMaxMarks,
        percentage: data.totalMaxMarks > 0
            ? (data.totalMarks / data.totalMaxMarks) * 100
            : 0
    })).sort((a, b) => b.percentage - a.percentage);

    let skillsHTML = `
        <h3>تحليل التحصيل حسب المهارات</h3>
    `;

    if (sortedSkills.length === 0) {
        skillsHTML += `
            <p>لم يتم تصنيف الأسئلة حسب المهارات.</p>
        `;
    } else {
        sortedSkills.forEach(skill => {
            skillsHTML += `
                <div class="question-item">
                    <h4>${skill.name}</h4>
                    <p>مجموع علامات الطالبات: ${skill.totalMarks}</p>
                    <p>مجموع العلامات القصوى: ${skill.totalMaxMarks}</p>
                    <p>نسبة التحصيل: ${skill.percentage.toFixed(2)}%</p>
                </div>
            `;
        });
    }

    resultsArea.innerHTML += skillsHTML;
}


function renderFailureAnalysis(exam, resultsArea) {
    const reasonCounts = {};

    let totalReasons = 0;

    exam.students.forEach(student => {
        student.questions.forEach(question => {
            (question.reasons || []).forEach(reason => {
                if (reason === "أسباب أخرى") {
                    return;
                }

                reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
                totalReasons++;
            });

            if (question.otherReason && question.otherReason.trim()) {
                const other = question.otherReason.trim();

                reasonCounts[other] = (reasonCounts[other] || 0) + 1;
                totalReasons++;
            }
        });
    });

    let html = `
        <h3>تحليل أسباب الإخفاق</h3>
    `;

    if (totalReasons === 0) {
        html += `<p>لم يتم تسجيل أسباب إخفاق في هذا الامتحان.</p>`;
    } else {
        const sortedReasons = Object.entries(reasonCounts)
            .sort((a, b) => b[1] - a[1]);

        sortedReasons.forEach(([reason, count]) => {
            const percentage = (count / totalReasons) * 100;

            html += `
                <div class="question-item">
                    <h4>${reason}</h4>
                    <p>عدد مرات التكرار: ${count}</p>
                    <p>نسبة التكرار: ${percentage.toFixed(2)}%</p>
                </div>
            `;
        });
    }

    resultsArea.innerHTML += html;
}
// فتح امتحان محفوظ
function openSavedExam(examId) {
    const exam = exams.find(item => item.id === examId);

    if (!exam) {
        alert("لم يتم العثور على الامتحان.");
        return;
    }

    currentExam = exam;
    currentStudentIndex = exam.students.length;

    showStudentForm();
    loadStudentQuestions();

    document.getElementById("student-entry-area").scrollIntoView({
        behavior: "smooth"
    });
}


// عرض الامتحانات عند فتح الموقع
renderSavedExams();


// =====================================
// تقارير EMY: Excel والطباعة / PDF
// =====================================

function getReportExam() {
    if (!currentAnalysisExamId) {
        alert("اختاري امتحانًا من قائمة التحليل أولًا.");
        return null;
    }

    const exam = exams.find(item => item.id === currentAnalysisExamId);

    if (!exam) {
        alert("لم يتم العثور على الامتحان المحدد.");
        return null;
    }

    return exam;
}

function reportEscape(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getExamReportData(exam) {
    const students = exam.students || [];
    const questions = exam.questions || [];
    const totalMax = questions.reduce(
        (sum, question) => sum + (Number(question.maxMark) || 0), 0
    );

    const questionRows = questions.map((question, index) => {
        let totalMarks = 0;
        let totalPossible = 0;

        students.forEach(student => {
            const result = student.questions?.[index];
            if (result) {
                totalMarks += Number(result.mark) || 0;
                totalPossible += Number(result.maxMark) || Number(question.maxMark) || 0;
            }
        });

        return {
            number: question.number || index + 1,
            skill: question.skill || "غير محددة",
            totalMarks,
            totalPossible,
            percentage: totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0
        };
    });

    const skillMap = {};
    questionRows.forEach(row => {
        const skill = row.skill;
        if (!skill || skill === "غير محددة") return;

        if (!skillMap[skill]) {
            skillMap[skill] = { totalMarks: 0, totalPossible: 0 };
        }

        skillMap[skill].totalMarks += row.totalMarks;
        skillMap[skill].totalPossible += row.totalPossible;
    });

    const skillRows = Object.entries(skillMap).map(([skill, data]) => ({
        skill,
        totalMarks: data.totalMarks,
        totalPossible: data.totalPossible,
        percentage: data.totalPossible > 0
            ? (data.totalMarks / data.totalPossible) * 100
            : 0
    }));

    const reasonMap = {};
    students.forEach(student => {
        (student.questions || []).forEach(question => {
            (question.reasons || []).forEach(reason => {
                if (reason && reason !== "أسباب أخرى") {
                    reasonMap[reason] = (reasonMap[reason] || 0) + 1;
                }
            });

            const other = (question.otherReason || "").trim();
            if (other) {
                reasonMap[other] = (reasonMap[other] || 0) + 1;
            }
        });
    });

    const reasonTotal = Object.values(reasonMap).reduce((sum, count) => sum + count, 0);
    const reasonRows = Object.entries(reasonMap)
        .map(([reason, count]) => ({
            reason,
            count,
            percentage: reasonTotal > 0 ? (count / reasonTotal) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

    return { students, questions, totalMax, questionRows, skillRows, reasonRows };
}

function exportCurrentExamExcel() {
    const exam = getReportExam();
    if (!exam) return;

    if (typeof XLSX === "undefined") {
        alert("تعذر تحميل أداة Excel. تأكدي من اتصال الإنترنت ثم أعيدي فتح التطبيق.");
        return;
    }

    const data = getExamReportData(exam);
    const workbook = XLSX.utils.book_new();

    // الورقة الأولى: بيانات الطالبات وعلاماتهن
    const studentSheet = [
        ["اسم الامتحان", exam.name],
        ["الصف والشعبة", exam.className],
        ["تاريخ الامتحان", exam.date || "غير محدد"],
        ["عدد الطالبات", data.students.length],
        ["العلامة الكلية", data.totalMax],
        [],
        [
            "اسم الطالبة",
            ...data.questions.map((question, index) => `السؤال ${question.number || index + 1}`),
            "المجموع",
            "النسبة المئوية",
            "نسبة الإخفاق"
        ]
    ];

    data.students.forEach(student => {
        const marks = data.questions.map((question, index) => {
            const result = student.questions?.[index];
            return result ? (Number(result.mark) || 0) : "";
        });

        studentSheet.push([
            student.name,
            ...marks,
            Number(student.totalMark) || 0,
            Number(student.percentage) || 0,
            Number(student.failurePercentage) || 0
        ]);
    });

    XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet(studentSheet),
        "علامات الطالبات"
    );

    // الورقة الثانية: تحليل الأسئلة والمهارات
    const analysisSheet = [
        ["تحليل الأسئلة"],
        ["رقم السؤال", "المهارة", "مجموع العلامات", "مجموع العلامات القصوى", "نسبة التحصيل %"],
        ...data.questionRows.map(row => [
            row.number, row.skill, row.totalMarks, row.totalPossible,
            Number(row.percentage.toFixed(2))
        ]),
        [],
        ["تحليل المهارات"],
        ["المهارة", "مجموع العلامات", "مجموع العلامات القصوى", "نسبة التحصيل %"],
        ...data.skillRows.map(row => [
            row.skill, row.totalMarks, row.totalPossible,
            Number(row.percentage.toFixed(2))
        ])
    ];

    XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet(analysisSheet),
        "تحليل الأسئلة والمهارات"
    );

    // الورقة الثالثة: أسباب الإخفاق
    const reasonsSheet = [
        ["سبب الإخفاق", "عدد مرات التكرار", "نسبة التكرار %"],
        ...data.reasonRows.map(row => [
            row.reason, row.count, Number(row.percentage.toFixed(2))
        ])
    ];

    XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet(reasonsSheet),
        "أسباب الإخفاق"
    );

    const safeName = String(exam.name || "EMY")
        .replace(/[\\/:*?"<>|]/g, "_")
        .trim();

    XLSX.writeFile(workbook, `تقرير_${safeName || "EMY"}.xlsx`);
}

function printCurrentExamReport() {
    const exam = getReportExam();
    if (!exam) return;

    const data = getExamReportData(exam);
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("المتصفح منع نافذة التقرير. اسمحي بالنوافذ المنبثقة لهذا الملف ثم حاولي مرة أخرى.");
        return;
    }

    const studentRows = data.students.map(student => `
        <tr>
            <td>${reportEscape(student.name)}</td>
            ${(data.questions || []).map((question, index) => {
                const result = student.questions?.[index];
                return `<td>${result ? reportEscape(result.mark) : "—"}</td>`;
            }).join("")}
            <td>${Number(student.totalMark) || 0}</td>
            <td>${(Number(student.percentage) || 0).toFixed(2)}%</td>
        </tr>
    `).join("");

    const questionRows = data.questionRows.map(row => `
        <tr>
            <td>${reportEscape(row.number)}</td>
            <td>${reportEscape(row.skill)}</td>
            <td>${row.totalMarks}</td>
            <td>${row.totalPossible}</td>
            <td>${row.percentage.toFixed(2)}%</td>
        </tr>
    `).join("");

    const skillRows = data.skillRows.map(row => `
        <tr>
            <td>${reportEscape(row.skill)}</td>
            <td>${row.totalMarks}</td>
            <td>${row.totalPossible}</td>
            <td>${row.percentage.toFixed(2)}%</td>
        </tr>
    `).join("");

    const reasonRows = data.reasonRows.map(row => `
        <tr>
            <td>${reportEscape(row.reason)}</td>
            <td>${row.count}</td>
            <td>${row.percentage.toFixed(2)}%</td>
        </tr>
    `).join("");

    printWindow.document.open();
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>تقرير ${reportEscape(exam.name)}</title>
            <style>
                body { font-family: Tahoma, Arial, sans-serif; color: #59434D; padding: 24px; line-height: 1.7; }
                h1, h2 { color: #A96680; }
                h1 { text-align: center; }
                .details { background: #FFF7F2; padding: 14px; border: 1px solid #EAD1D8; border-radius: 10px; }
                table { width: 100%; border-collapse: collapse; margin: 12px 0 28px; }
                th, td { border: 1px solid #D9C4CC; padding: 7px; text-align: center; }
                th { background: #F5DDE5; }
                .note { color: #927D83; font-size: 12px; }
                @media print { body { padding: 0; } button { display: none; } tr { break-inside: avoid; } }
            </style>
        </head>
        <body>
            <h1>تقرير نتائج الامتحان</h1>
            <div class="details">
                <p><strong>اسم الامتحان:</strong> ${reportEscape(exam.name)}</p>
                <p><strong>الصف والشعبة:</strong> ${reportEscape(exam.className)}</p>
                <p><strong>التاريخ:</strong> ${reportEscape(exam.date || "غير محدد")}</p>
                <p><strong>عدد الطالبات:</strong> ${data.students.length}</p>
                <p><strong>العلامة الكلية:</strong> ${data.totalMax}</p>
            </div>

            <h2>علامات الطالبات</h2>
            <table>
                <thead><tr>
                    <th>اسم الطالبة</th>
                    ${data.questions.map((question, index) => `<th>س${reportEscape(question.number || index + 1)}</th>`).join("")}
                    <th>المجموع</th><th>التحصيل</th>
                </tr></thead>
                <tbody>${studentRows || `<tr><td colspan="${data.questions.length + 3}">لا توجد طالبات محفوظات</td></tr>`}</tbody>
            </table>

            <h2>تحليل الأسئلة</h2>
            <table>
                <thead><tr><th>السؤال</th><th>المهارة</th><th>العلامات</th><th>العلامات القصوى</th><th>التحصيل</th></tr></thead>
                <tbody>${questionRows}</tbody>
            </table>

            <h2>تحليل المهارات</h2>
            <table>
                <thead><tr><th>المهارة</th><th>العلامات</th><th>العلامات القصوى</th><th>التحصيل</th></tr></thead>
                <tbody>${skillRows || `<tr><td colspan="4">لم يتم تصنيف الأسئلة حسب المهارات</td></tr>`}</tbody>
            </table>

            <h2>أسباب الإخفاق</h2>
            <table>
                <thead><tr><th>السبب</th><th>عدد مرات التكرار</th><th>النسبة</th></tr></thead>
                <tbody>${reasonRows || `<tr><td colspan="3">لم يتم تسجيل أسباب إخفاق</td></tr>`}</tbody>
            </table>

            <p class="note">تم إنشاء هذا التقرير بواسطة EMY - مساعد معلمتي.</p>
            <script>window.onload = function () { window.print(); };</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}



// =====================================
// EMY - إنشاء الأنشطة وحفظها
// =====================================
let activities = JSON.parse(localStorage.getItem("emyActivities") || "[]");

function saveActivitiesToStorage() {
    localStorage.setItem("emyActivities", JSON.stringify(activities));
}

function showActivities() {
    document.getElementById("exam-setup").style.display = "none";
    document.getElementById("analysis-area").style.display = "none";
    document.getElementById("activities-area").style.display = "block";
    renderSavedActivities();
    document.getElementById("activities-area").scrollIntoView({ behavior: "smooth" });
}

function activityEscape(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
    }[char]));
}

function getActivityFormData() {
    return {
        id: document.getElementById("activity-id").value || Date.now().toString(),
        title: document.getElementById("activity-title").value.trim(),
        subject: document.getElementById("activity-subject").value.trim(),
        grade: document.getElementById("activity-grade").value.trim(),
        type: document.getElementById("activity-type").value,
        instructions: document.getElementById("activity-instructions").value.trim(),
        content: document.getElementById("activity-content").value.trim(),
        updatedAt: new Date().toISOString()
    };
}

function validateActivity(activity) {
    if (!activity.title) { alert("يرجى كتابة عنوان النشاط."); document.getElementById("activity-title").focus(); return false; }
    if (!activity.subject) { alert("يرجى كتابة المادة."); document.getElementById("activity-subject").focus(); return false; }
    if (!activity.content) { alert("يرجى كتابة محتوى النشاط أو أسئلته."); document.getElementById("activity-content").focus(); return false; }
    return true;
}

function saveActivity() {
    const activity = getActivityFormData();
    if (!validateActivity(activity)) return;
    const index = activities.findIndex(item => String(item.id) === String(activity.id));
    if (index >= 0) activities[index] = activity;
    else activities.unshift(activity);
    saveActivitiesToStorage();
    renderSavedActivities();
    document.getElementById("activity-preview").style.display = "none";
    alert("تم حفظ النشاط بنجاح.");
    clearActivityForm(false);
}

function clearActivityForm(hidePreview = true) {
    ["activity-id", "activity-title", "activity-subject", "activity-grade", "activity-instructions", "activity-content"].forEach(id => {
        document.getElementById(id).value = "";
    });
    document.getElementById("activity-type").value = "ورقة عمل";
    if (hidePreview) document.getElementById("activity-preview").style.display = "none";
}

function editActivity(id) {
    const activity = activities.find(item => String(item.id) === String(id));
    if (!activity) return;
    document.getElementById("activity-id").value = activity.id;
    document.getElementById("activity-title").value = activity.title || "";
    document.getElementById("activity-subject").value = activity.subject || "";
    document.getElementById("activity-grade").value = activity.grade || "";
    document.getElementById("activity-type").value = activity.type || "ورقة عمل";
    document.getElementById("activity-instructions").value = activity.instructions || "";
    document.getElementById("activity-content").value = activity.content || "";
    document.getElementById("activity-preview").style.display = "none";
    document.getElementById("activity-editor").scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteActivity(id) {
    const activity = activities.find(item => String(item.id) === String(id));
    if (!activity) return;
    if (!confirm(`هل أنت متأكدة من حذف النشاط «${activity.title}»؟`)) return;
    activities = activities.filter(item => String(item.id) !== String(id));
    saveActivitiesToStorage();
    renderSavedActivities();
    document.getElementById("activity-preview").style.display = "none";
}

function buildActivityDocument(activity) {
    const instructions = activity.instructions
        ? `<h3>التعليمات</h3><p>${activityEscape(activity.instructions).split(String.fromCharCode(10)).join("<br>")}</p>` : "";
    return `
        <div class="print-activity">
            <div class="print-activity-heading"><h1>${activityEscape(activity.title)}</h1><p>${activityEscape(activity.type)} | ${activityEscape(activity.subject)}${activity.grade ? " | " + activityEscape(activity.grade) : ""}</p></div>
            <div class="student-details"><span>اسم الطالبة: ........................................</span><span>التاريخ: ....................</span></div>
            ${instructions}
            <h3>النشاط</h3><div class="activity-body">${activityEscape(activity.content).split(String.fromCharCode(10)).join("<br>")}</div>
            <div class="activity-footer">مع تمنياتي لكن بالتوفيق والتميز ♡</div>
        </div>`;
}

function previewActivity() {
    const activity = getActivityFormData();
    if (!validateActivity(activity)) return;
    const preview = document.getElementById("activity-preview");
    preview.innerHTML = buildActivityDocument(activity) + `<div class="activity-actions no-print"><button onclick="printActivityPreview()">طباعة النشاط / حفظ PDF</button></div>`;
    preview.style.display = "block";
    preview.scrollIntoView({ behavior: "smooth", block: "start" });
}

function printActivityPreview() {
    const activity = getActivityFormData();
    if (!validateActivity(activity)) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) { alert("المتصفح منع نافذة الطباعة. اسمحي بالنوافذ المنبثقة ثم حاولي مرة أخرى."); return; }
    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${activityEscape(activity.title)}</title><style>body{font-family:Tahoma,Arial,sans-serif;color:#59434D;padding:28px;line-height:2}.print-activity{max-width:850px;margin:auto}.print-activity-heading{text-align:center;border-bottom:2px solid #D99BAF;padding-bottom:15px}.print-activity-heading h1{color:#A96680}.student-details{display:flex;justify-content:space-between;gap:20px;margin:25px 0}.activity-body{white-space:normal;min-height:240px;border:1px solid #EAD1D8;border-radius:10px;padding:18px}.activity-footer{text-align:center;margin-top:35px;color:#A96680}@media print{body{padding:0}}</style></head><body>${buildActivityDocument(activity)}<script>window.onload=()=>window.print();<\/script></body></html>`);
    printWindow.document.close();
}

function printSavedActivity(id) {
    const activity = activities.find(item => String(item.id) === String(id));
    if (!activity) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) { alert("المتصفح منع نافذة الطباعة. اسمحي بالنوافذ المنبثقة ثم حاولي مرة أخرى."); return; }
    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${activityEscape(activity.title)}</title><style>body{font-family:Tahoma,Arial,sans-serif;color:#59434D;padding:28px;line-height:2}.print-activity{max-width:850px;margin:auto}.print-activity-heading{text-align:center;border-bottom:2px solid #D99BAF;padding-bottom:15px}.print-activity-heading h1{color:#A96680}.student-details{display:flex;justify-content:space-between;margin:25px 0}.activity-body{min-height:240px;border:1px solid #EAD1D8;border-radius:10px;padding:18px;white-space:normal}.activity-footer{text-align:center;margin-top:35px;color:#A96680}@media print{body{padding:0}}</style></head><body>${buildActivityDocument(activity)}<script>window.onload=()=>window.print();<\/script></body></html>`);
    printWindow.document.close();
}

function renderSavedActivities() {
    const area = document.getElementById("saved-activities-list");
    if (!area) return;
    area.innerHTML = "";
    if (!activities.length) { area.textContent = "لا توجد أنشطة محفوظة حتى الآن."; return; }
    activities.forEach(activity => {
        const card = document.createElement("div");
        card.className = "question-item activity-saved-card";
        const title = document.createElement("h3");
        title.textContent = activity.title;
        const info = document.createElement("p");
        info.textContent = `${activity.type || "نشاط"} — ${activity.subject || "بدون مادة"}${activity.grade ? " — " + activity.grade : ""}`;
        const edit = document.createElement("button");
        edit.textContent = "تعديل"; edit.onclick = () => editActivity(activity.id);
        const print = document.createElement("button");
        print.textContent = "طباعة"; print.onclick = () => printSavedActivity(activity.id);
        const remove = document.createElement("button");
        remove.textContent = "حذف"; remove.className = "secondary-button"; remove.onclick = () => deleteActivity(activity.id);
        card.append(title, info, edit, print, remove);
        area.appendChild(card);
    });
}


// =====================================
// EMY - الجداول العامة وجداول نتائج الامتحانات
// =====================================
let customTableData = { id: null, title: "", headers: [], rows: [] };
let savedCustomTables = JSON.parse(localStorage.getItem("emyCustomTables") || "[]");

function saveCustomTablesStorage() {
    localStorage.setItem("emyCustomTables", JSON.stringify(savedCustomTables));
}

function showTables() {
    ["exam-setup", "analysis-area", "activities-area"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
    document.getElementById("tables-area").style.display = "block";
    document.getElementById("general-table-area").style.display = "none";
    document.getElementById("exam-table-area").style.display = "none";
    renderSavedCustomTables();
    populateExamTableSelect();
    document.getElementById("tables-area").scrollIntoView({ behavior: "smooth" });
}

function showGeneralTable() {
    document.getElementById("general-table-area").style.display = "block";
    document.getElementById("exam-table-area").style.display = "none";
    renderSavedCustomTables();
    if (!customTableData.headers.length) buildCustomTable();
    document.getElementById("general-table-area").scrollIntoView({ behavior: "smooth", block: "start" });
}

function showExamTable() {
    document.getElementById("general-table-area").style.display = "none";
    document.getElementById("exam-table-area").style.display = "block";
    populateExamTableSelect();
    renderExamResultsTable();
    document.getElementById("exam-table-area").scrollIntoView({ behavior: "smooth", block: "start" });
}

function validTableDimension(value, min, max) {
    const n = Number(value);
    return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

function buildCustomTable() {
    const rowCount = validTableDimension(document.getElementById("custom-table-rows").value, 1, 100);
    const colCount = validTableDimension(document.getElementById("custom-table-cols").value, 1, 20);
    if (!rowCount || !colCount) {
        alert("عدد الصفوف يجب أن يكون من 1 إلى 100، وعدد الأعمدة من 1 إلى 20.");
        return;
    }
    const title = document.getElementById("custom-table-title").value.trim();
    const oldHeaders = customTableData.headers || [];
    const oldRows = customTableData.rows || [];
    const headers = Array.from({ length: colCount }, (_, i) => oldHeaders[i] ?? `العمود ${i + 1}`);
    const rows = Array.from({ length: rowCount }, (_, r) =>
        Array.from({ length: colCount }, (_, c) => oldRows[r]?.[c] ?? "")
    );
    customTableData = { id: customTableData.id, title, headers, rows };
    renderCustomTableEditor();
}

function renderCustomTableEditor() {
    const area = document.getElementById("custom-table-editor");
    if (!area) return;
    if (!customTableData.headers.length) {
        area.innerHTML = '<p class="table-empty">حددي أبعاد الجدول ثم اضغطي «إنشاء / إعادة بناء الجدول».</p>';
        return;
    }
    let html = '<table class="emy-data-table"><thead><tr><th>رقم</th>';
    customTableData.headers.forEach((header, index) => {
        html += `<th><input aria-label="عنوان العمود ${index + 1}" data-header="${index}" value="${escapeTableHtml(header)}"></th>`;
    });
    html += '</tr></thead><tbody>';
    customTableData.rows.forEach((row, r) => {
        html += `<tr><th>${r + 1}</th>`;
        row.forEach((value, c) => {
            html += `<td><input aria-label="الصف ${r + 1} العمود ${c + 1}" data-row="${r}" data-col="${c}" value="${escapeTableHtml(value)}"></td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    area.innerHTML = html;
    area.querySelectorAll("[data-header]").forEach(input => {
        input.addEventListener("input", () => {
            customTableData.headers[Number(input.dataset.header)] = input.value;
        });
    });
    area.querySelectorAll("[data-row]").forEach(input => {
        input.addEventListener("input", () => {
            customTableData.rows[Number(input.dataset.row)][Number(input.dataset.col)] = input.value;
        });
    });

    // Enter: move vertically in the same column; create a new row at the bottom.
    area.querySelectorAll("input[data-header], input[data-row]").forEach(input => {
        input.addEventListener("keydown", event => {
            if (event.key !== "Enter") return;
            event.preventDefault();

            const col = input.hasAttribute("data-header")
                ? Number(input.dataset.header)
                : Number(input.dataset.col);

            if (input.hasAttribute("data-header")) {
                const firstCell = area.querySelector(`[data-row="0"][data-col="${col}"]`);
                if (firstCell) firstCell.focus();
                return;
            }

            const currentRow = Number(input.dataset.row);
            const nextRow = currentRow + (event.shiftKey ? -1 : 1);

            if (event.shiftKey) {
                if (nextRow < 0) {
                    const headerCell = area.querySelector(`[data-header="${col}"]`);
                    if (headerCell) headerCell.focus();
                } else {
                    const previousCell = area.querySelector(`[data-row="${nextRow}"][data-col="${col}"]`);
                    if (previousCell) previousCell.focus();
                }
                return;
            }

            if (nextRow < customTableData.rows.length) {
                const nextCell = area.querySelector(`[data-row="${nextRow}"][data-col="${col}"]`);
                if (nextCell) nextCell.focus();
                return;
            }

            addCustomRow();
            const newCell = area.querySelector(`[data-row="${nextRow}"][data-col="${col}"]`);
            if (newCell) newCell.focus();
        });
    });
}

function escapeTableHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
}

function addCustomRow() {
    if (!customTableData.headers.length) { buildCustomTable(); return; }
    if (customTableData.rows.length >= 100) { alert("الحد الأقصى 100 صف."); return; }
    customTableData.rows.push(Array(customTableData.headers.length).fill(""));
    document.getElementById("custom-table-rows").value = customTableData.rows.length;
    renderCustomTableEditor();
}

function addCustomColumn() {
    if (!customTableData.headers.length) { buildCustomTable(); return; }
    if (customTableData.headers.length >= 20) { alert("الحد الأقصى 20 عمودًا."); return; }
    customTableData.headers.push(`العمود ${customTableData.headers.length + 1}`);
    customTableData.rows.forEach(row => row.push(""));
    document.getElementById("custom-table-cols").value = customTableData.headers.length;
    renderCustomTableEditor();
}

function removeCustomRow() {
    if (customTableData.rows.length <= 1) { alert("يجب أن يبقى صف واحد على الأقل."); return; }
    customTableData.rows.pop();
    document.getElementById("custom-table-rows").value = customTableData.rows.length;
    renderCustomTableEditor();
}

function removeCustomColumn() {
    if (customTableData.headers.length <= 1) { alert("يجب أن يبقى عمود واحد على الأقل."); return; }
    customTableData.headers.pop();
    customTableData.rows.forEach(row => row.pop());
    document.getElementById("custom-table-cols").value = customTableData.headers.length;
    renderCustomTableEditor();
}

function newCustomTable() {
    customTableData = { id: null, title: "", headers: [], rows: [] };
    document.getElementById("custom-table-title").value = "";
    document.getElementById("custom-table-rows").value = 5;
    document.getElementById("custom-table-cols").value = 4;
    document.getElementById("custom-table-editor").innerHTML = "";
    buildCustomTable();
}

function saveCustomTable() {
    if (!customTableData.headers.length || !customTableData.rows.length) {
        alert("أنشئي الجدول أولًا.");
        return;
    }
    customTableData.title = document.getElementById("custom-table-title").value.trim() || "جدول بدون عنوان";
    if (!customTableData.id) customTableData.id = String(Date.now());
    const index = savedCustomTables.findIndex(item => String(item.id) === String(customTableData.id));
    const record = JSON.parse(JSON.stringify(customTableData));
    if (index >= 0) savedCustomTables[index] = record;
    else savedCustomTables.unshift(record);
    saveCustomTablesStorage();
    renderSavedCustomTables();
    alert("تم حفظ الجدول بنجاح.");
}

function loadCustomTable(id) {
    const found = savedCustomTables.find(item => String(item.id) === String(id));
    if (!found) return;
    customTableData = JSON.parse(JSON.stringify(found));
    document.getElementById("custom-table-title").value = found.title || "";
    document.getElementById("custom-table-rows").value = found.rows.length;
    document.getElementById("custom-table-cols").value = found.headers.length;
    renderCustomTableEditor();
    document.getElementById("general-table-area").scrollIntoView({ behavior: "smooth" });
}

function deleteCustomTable(id) {
    const found = savedCustomTables.find(item => String(item.id) === String(id));
    if (!found || !confirm(`هل تريدين حذف الجدول «${found.title}»؟`)) return;
    savedCustomTables = savedCustomTables.filter(item => String(item.id) !== String(id));
    saveCustomTablesStorage();
    if (String(customTableData.id) === String(id)) newCustomTable();
    renderSavedCustomTables();
}

function renderSavedCustomTables() {
    const area = document.getElementById("saved-custom-tables");
    if (!area) return;
    area.innerHTML = "";
    if (!savedCustomTables.length) {
        area.innerHTML = '<p class="table-empty">لا توجد جداول محفوظة حتى الآن.</p>';
        return;
    }
    savedCustomTables.forEach(table => {
        const card = document.createElement("div");
        card.className = "saved-table-card";
        const heading = document.createElement("strong");
        heading.textContent = table.title || "جدول بدون عنوان";
        const details = document.createElement("p");
        details.textContent = `${table.rows.length} صفوف × ${table.headers.length} أعمدة`;
        const edit = document.createElement("button");
        edit.textContent = "فتح وتعديل";
        edit.onclick = () => loadCustomTable(table.id);
        const remove = document.createElement("button");
        remove.textContent = "حذف";
        remove.className = "secondary-button";
        remove.onclick = () => deleteCustomTable(table.id);
        card.append(heading, details, edit, remove);
        area.appendChild(card);
    });
}

function customTableAsHtml(table) {
    return `<h2>${escapeTableHtml(table.title || "جدول")}</h2><table class="emy-data-table"><thead><tr><th>م</th>${table.headers.map(h => `<th>${escapeTableHtml(h)}</th>`).join("")}</tr></thead><tbody>${table.rows.map((row, i) => `<tr><th>${i + 1}</th>${row.map(v => `<td>${escapeTableHtml(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function printHtmlTable(title, bodyHtml) {
    const win = window.open("", "_blank");
    if (!win) { alert("المتصفح منع نافذة الطباعة. اسمحي بالنوافذ المنبثقة ثم حاولي مجددًا."); return; }
    win.document.open();
    win.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${escapeTableHtml(title)}</title><style>body{font-family:Tahoma,Arial,sans-serif;color:#59434D;padding:25px;line-height:1.8}h1,h2{color:#A96680;text-align:center}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border:1px solid #DDBFC9;padding:8px;text-align:center}th{background:#F5DDE5}@media print{body{padding:0}}</style></head><body><h1>${escapeTableHtml(title)}</h1>${bodyHtml}<script>window.onload=()=>window.print();<\/script></body></html>`);
    win.document.close();
}

function printCustomTable() {
    if (!customTableData.headers.length) { alert("أنشئي الجدول أولًا."); return; }
    syncCustomTableInputs();
    customTableData.title = document.getElementById("custom-table-title").value.trim() || "جدول";
    printHtmlTable(customTableData.title, customTableAsHtml(customTableData));
}

function syncCustomTableInputs() {
    const area = document.getElementById("custom-table-editor");
    if (!area) return;
    area.querySelectorAll("[data-header]").forEach(input => customTableData.headers[Number(input.dataset.header)] = input.value);
    area.querySelectorAll("[data-row]").forEach(input => customTableData.rows[Number(input.dataset.row)][Number(input.dataset.col)] = input.value);
}

function exportCustomTableExcel() {
    if (!customTableData.headers.length) { alert("أنشئي الجدول أولًا."); return; }
    if (typeof XLSX === "undefined") { alert("تصدير Excel يحتاج اتصالًا بالإنترنت لتحميل المكتبة."); return; }
    syncCustomTableInputs();
    const title = document.getElementById("custom-table-title").value.trim() || "جدول";
    const rows = [["م", ...customTableData.headers], ...customTableData.rows.map((row, i) => [i + 1, ...row])];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["عنوان الجدول", title], [], ...rows]), "الجدول");
    XLSX.writeFile(wb, `${title.replace(/[\\/:*?"<>|]/g, "_")}.xlsx`);
}

function populateExamTableSelect() {
    const select = document.getElementById("exam-table-select");
    if (!select) return;
    const previous = select.value;
    select.innerHTML = '<option value="">اختاري امتحانًا محفوظًا</option>';
    exams.forEach(exam => {
        const option = document.createElement("option");
        option.value = String(exam.id);
        option.textContent = `${exam.name} — ${exam.className}`;
        select.appendChild(option);
    });
    if (exams.some(exam => String(exam.id) === previous)) select.value = previous;
}

function getSelectedExamForTable() {
    const id = document.getElementById("exam-table-select").value;
    return exams.find(exam => String(exam.id) === id) || null;
}

function getExamTableData(exam) {
    const questions = exam.questions || [];
    const students = (exam.students || []).map(student => {
        const total = Number(student.totalMark) || 0;
        const maxTotal = questions.reduce((sum, q) => sum + (Number(q.maxMark) || 0), 0);
        return { ...student, totalMark: total, percentage: maxTotal ? total / maxTotal * 100 : 0 };
    }).sort((a, b) => b.totalMark - a.totalMark);
    const maxTotal = questions.reduce((sum, q) => sum + (Number(q.maxMark) || 0), 0);
    const average = students.length ? students.reduce((sum, s) => sum + s.totalMark, 0) / students.length : 0;
    return { students, maxTotal, average };
}

function renderExamResultsTable() {
    const area = document.getElementById("exam-table-output");
    const select = document.getElementById("exam-table-select");
    if (!area || !select) return;
    const exam = getSelectedExamForTable();
    if (!exam) { area.innerHTML = '<p class="table-empty">اختاري امتحانًا لعرض النتائج.</p>'; return; }
    const data = getExamTableData(exam);
    const highest = data.students.length ? data.students[0].totalMark : 0;
    const rows = data.students.map((student, index) => `<tr><td>${index + 1}</td><td>${escapeTableHtml(student.name || "بدون اسم")}</td><td>${student.totalMark}</td><td>${student.percentage.toFixed(2)}%</td></tr>`).join("");
    area.innerHTML = `
        <div class="table-summary">
            <span>عدد الطالبات: ${data.students.length}</span>
            <span>أعلى علامة: ${highest} / ${data.maxTotal}</span>
            <span>المعدل: ${data.average.toFixed(2)} / ${data.maxTotal}</span>
        </div>
        <div class="table-scroll">
            <table class="emy-data-table">
                <thead><tr><th>الترتيب</th><th>اسم الطالبة</th><th>العلامة</th><th>النسبة</th></tr></thead>
                <tbody>${rows || '<tr><td colspan="4">لا توجد طالبات محفوظات في هذا الامتحان.</td></tr>'}</tbody>
            </table>
        </div>`;
}

function printExamResultsTable() {
    const exam = getSelectedExamForTable();
    if (!exam) { alert("اختاري امتحانًا أولًا."); return; }
    const data = getExamTableData(exam);
    const highest = data.students.length ? data.students[0].totalMark : 0;
    const summary = `<p>الصف والشعبة: ${escapeTableHtml(exam.className)} | عدد الطالبات: ${data.students.length} | أعلى علامة: ${highest} / ${data.maxTotal} | المعدل: ${data.average.toFixed(2)}</p>`;
    const table = `<table><thead><tr><th>الترتيب</th><th>اسم الطالبة</th><th>العلامة</th><th>النسبة</th></tr></thead><tbody>${data.students.map((s, i) => `<tr><td>${i + 1}</td><td>${escapeTableHtml(s.name)}</td><td>${s.totalMark}</td><td>${s.percentage.toFixed(2)}%</td></tr>`).join("")}</tbody></table>`;
    printHtmlTable(`نتائج ${exam.name}`, summary + table);
}

function exportExamResultsExcel() {
    const exam = getSelectedExamForTable();
    if (!exam) { alert("اختاري امتحانًا أولًا."); return; }
    if (typeof XLSX === "undefined") { alert("تصدير Excel يحتاج اتصالًا بالإنترنت لتحميل المكتبة."); return; }
    const data = getExamTableData(exam);
    const rows = [
        ["الترتيب", "اسم الطالبة", "العلامة", "النسبة المئوية"],
        ...data.students.map((s, i) => [i + 1, s.name, s.totalMark, Number(s.percentage.toFixed(2))])
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ["اسم الامتحان", exam.name], ["الصف والشعبة", exam.className],
        ["أعلى علامة", data.students.length ? data.students[0].totalMark : 0],
        ["المعدل", Number(data.average.toFixed(2))], [], ...rows
    ]), "نتائج الطالبات");
    XLSX.writeFile(wb, `نتائج_${String(exam.name).replace(/[\\/:*?"<>|]/g, "_")}.xlsx`);
}
