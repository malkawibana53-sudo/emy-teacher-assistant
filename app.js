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

    questionsArea.innerHTML = `
        <div class="question-bulk-tools">
            <h3>تحديد موحّد لمجموعة من الأسئلة</h3>
            <p>اختاري الأسئلة التي تريدين توحيد بياناتها، ثم أدخلي العلامة والمهارة واضغطي «تطبيق على المحدد». ويمكنك تعديل أي سؤال منفردًا بعد ذلك.</p>
            <div class="question-bulk-grid">
                <div><label for="common-question-mark">العلامة القصوى المشتركة</label><input id="common-question-mark" type="number" min="0.5" step="0.5" placeholder="مثلاً: 5"></div>
                <div><label for="common-question-skill">المهارة المشتركة</label><select id="common-question-skill">
                    <option value="__keep__" selected>الإبقاء على مهارة كل سؤال</option><option value="">بدون تصنيف</option><option value="Grammar">القواعد (Grammar)</option><option value="Vocabulary">المفردات (Vocabulary)</option><option value="Reading">القراءة (Reading)</option><option value="Writing">الكتابة (Writing)</option><option value="Translation">الترجمة (Translation)</option><option value="Listening">الاستماع (Listening)</option><option value="Speaking">المحادثة (Speaking)</option>
                </select></div>
            </div>
            <div class="question-bulk-actions">
                <button type="button" class="secondary-button" onclick="selectQuestionBatch(true)">تحديد جميع الأسئلة</button>
                <button type="button" class="secondary-button" onclick="selectQuestionBatch(false)">إلغاء التحديد</button>
                <button type="button" onclick="applyQuestionBatch()">تطبيق على المحدد</button>
            </div>
            <p id="question-batch-status" class="helper-text">يمكنك اختيار سؤال واحد أو عدة أسئلة أو تحديدها كلها.</p>
        </div>`;

    for (let i = 1; i <= count; i++) {
        questionsArea.innerHTML += `
            <div class="question-item">
                <h3><label class="question-select-label"><input type="checkbox" class="question-batch-select" checked> تحديد</label> السؤال ${i}</h3>

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


// تطبيق العلامة والمهارة على مجموعة أسئلة محددة
function selectQuestionBatch(checked) {
    document.querySelectorAll(".question-batch-select").forEach(box => box.checked = Boolean(checked));
    const status = document.getElementById("question-batch-status");
    if (status) status.textContent = checked ? "تم تحديد جميع الأسئلة." : "أُلغي تحديد جميع الأسئلة.";
}

function applyQuestionBatch() {
    const selected = Array.from(document.querySelectorAll(".question-item")).filter(item => item.querySelector(".question-batch-select")?.checked);
    if (!selected.length) { alert("حددي سؤالًا واحدًا على الأقل أولًا."); return; }
    const markInput = document.getElementById("common-question-mark");
    const skillInput = document.getElementById("common-question-skill");
    const markValue = markInput?.value ?? "";
    const mark = Number(markValue);
    if (markValue !== "" && (!Number.isFinite(mark) || mark <= 0)) {
        alert("أدخلي علامة قصوى صحيحة أكبر من صفر، أو اتركيها فارغة إذا أردتِ تطبيق المهارة فقط.");
        markInput?.focus(); return;
    }
    selected.forEach(item => {
        const maxInput = item.querySelector(".max-mark");
        const skillSelect = item.querySelector(".question-skill");
        if (markValue !== "" && maxInput) maxInput.value = mark;
        if (skillSelect && skillInput && skillInput.value !== "__keep__") skillSelect.value = skillInput.value;
    });
    calculateExamTotal();
    const status = document.getElementById("question-batch-status");
    if (status) status.textContent = `تم تطبيق البيانات على ${selected.length} سؤال/أسئلة. يمكنك تعديل أي سؤال بصورة مستقلة.`;
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
                <p class="question-error-message" aria-live="polite"></p>
                <p class="question-percentage"></p>

                <label>أسباب الإخفاق</label>

                <div class="failure-reasons">
                    <label>
                        <input type="checkbox" class="failure-reason" value="ضعف فهم المفهوم">
                        ضعف فهم المفهوم
                    </label>

                    <label>
                        <input type="checkbox" class="failure-reason" value="عدم إتقان المهارة">
                        عدم إتقان المهارة
                    </label>

                    <label>
                        <input type="checkbox" class="failure-reason" value="خطأ في خطوات الحل">
                        خطأ في خطوات الحل
                    </label>

                    <label>
                        <input type="checkbox" class="failure-reason" value="خطأ حسابي">
                        خطأ حسابي
                    </label>

                    <label>
                        <input type="checkbox" class="failure-reason" value="عدم فهم المطلوب">
                        عدم فهم المطلوب
                    </label>

                    <label>
                        <input type="checkbox" class="failure-reason" value="عدم إكمال الإجابة">
                        عدم إكمال الإجابة
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
        button.textContent = "فتح الامتحان وتعديل العلامات";

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
    if (!students.length) {
        resultsArea.innerHTML = `<div class="analysis-empty">لا توجد طالبات محفوظات في هذا الامتحان.</div>`;
        openAnalysisSubtab("results");
        return;
    }

    const maxTotal = (exam.questions || []).reduce((sum, q) => sum + (Number(q.maxMark) || 0), 0);
    const passingMark = maxTotal / 2;
    const successful = students.filter(s => Number(s.totalMark) >= passingMark).length;
    const failed = students.length - successful;
    const average = students.reduce((sum, s) => sum + (Number(s.totalMark) || 0), 0) / students.length;
    const achievement = maxTotal > 0 ? average / maxTotal * 100 : 0;
    const successRate = successful / students.length * 100;
    const failureRate = failed / students.length * 100;

    const sortedScores = students.map(s => Number(s.totalMark) || 0).sort((a,b) => a-b);
    const median = sortedScores.length % 2
        ? sortedScores[Math.floor(sortedScores.length / 2)]
        : (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2;

    resultsArea.innerHTML = `
      <div class="analysis-heading">
        <div>
          <span class="analysis-eyebrow">لوحة متابعة الأداء</span>
          <h2>${reportEscape(exam.name)}</h2>
          <p>${reportEscape(exam.className)} ${exam.date ? " • " + reportEscape(exam.date) : ""}</p>
        </div>
        <div class="analysis-heading-actions">
          <button type="button" class="secondary-button" onclick="openAnalysisSubtab('choose')">اختيار امتحان آخر</button>
        </div>
      </div>

      <div class="analysis-kpi-grid">
        <article class="analysis-kpi"><span>متوسط التحصيل</span><strong>${achievement.toFixed(1)}%</strong><small>من العلامة الكلية ${maxTotal}</small></article>
        <article class="analysis-kpi"><span>نسبة النجاح</span><strong>${successRate.toFixed(1)}%</strong><small>${successful} طالبة ناجحة</small></article>
        <article class="analysis-kpi"><span>نسبة الإخفاق</span><strong>${failureRate.toFixed(1)}%</strong><small>${failed} طالبة دون علامة النجاح</small></article>
        <article class="analysis-kpi"><span>متوسط العلامات</span><strong>${average.toFixed(2)}</strong><small>الوسيط ${median.toFixed(2)} من ${maxTotal}</small></article>
      </div>

      <div class="analysis-grid">
        <section class="analysis-panel analysis-span-2">
          <div class="analysis-panel-title"><div><h3>مؤشر النجاح والإخفاق</h3><p>توزيع الطالبات بحسب علامة النجاح (${passingMark})</p></div></div>
          <div class="passfail-track" role="img" aria-label="نسبة النجاح ${successRate.toFixed(1)} بالمئة ونسبة الإخفاق ${failureRate.toFixed(1)} بالمئة">
            <div class="pass-segment" style="width:${successRate}%"></div>
            <div class="fail-segment" style="width:${failureRate}%"></div>
          </div>
          <div class="chart-legend"><span><i class="legend-dot pass-dot"></i> ناجحات: ${successful} (${successRate.toFixed(1)}%)</span><span><i class="legend-dot fail-dot"></i> غير ناجحات: ${failed} (${failureRate.toFixed(1)}%)</span></div>
        </section>
        <section class="analysis-panel">
          <div class="analysis-panel-title"><div><h3>ملخص الامتحان</h3><p>المعلومات الأساسية</p></div></div>
          <div class="analysis-facts">
            <div><span>عدد الطالبات</span><strong>${students.length}</strong></div>
            <div><span>عدد الأسئلة</span><strong>${exam.questions.length}</strong></div>
            <div><span>العلامة الكلية</span><strong>${maxTotal}</strong></div>
            <div><span>علامة النجاح</span><strong>${passingMark}</strong></div>
          </div>
        </section>
        <section class="analysis-panel analysis-span-2" id="question-chart-panel">
          <div class="analysis-panel-title"><div><h3>التحصيل في كل سؤال ومهارته</h3><p>كل عمود يوضح متوسط ما حققته الطالبات من علامة السؤال القصوى</p></div></div>
          <div id="question-performance-chart" class="analysis-bars"></div>
        </section>
        <section class="analysis-panel analysis-span-2" id="skill-chart-panel">
          <div class="analysis-panel-title"><div><h3>مقارنة المهارات</h3><p>متوسط التحصيل في الأسئلة المصنفة ضمن كل مهارة</p></div></div>
          <div id="skill-performance-chart" class="analysis-bars"></div>
        </section>
        <section class="analysis-panel analysis-span-2">
          <div class="analysis-panel-title"><div><h3>ملاحظات تساعد المعلمة</h3><p>استنتاجات رقمية مبنية على نتائج هذا الامتحان</p></div></div>
          <div id="analysis-insights" class="analysis-insights"></div>
        </section>
        <section class="analysis-panel analysis-span-2">
          <div class="analysis-panel-title"><div><h3>تفاصيل الأسئلة</h3><p>العلامات والمهارات ونسب التحصيل</p></div></div>
          <div id="question-analysis-details" class="analysis-detail-grid"></div>
        </section>
        <section class="analysis-panel analysis-span-2">
          <div id="failure-analysis-content"></div>
        </section>
      </div>
    `;

    renderQuestionAnalysis(exam, resultsArea);

    const questionRows = exam.questions.map((q, index) => {
        let marks = 0, possible = 0;
        students.forEach(student => {
            const result = student.questions?.[index];
            if (result) {
                marks += Number(result.mark) || 0;
                possible += Number(result.maxMark) || Number(q.maxMark) || 0;
            }
        });
        return {
            number: q.number || index + 1,
            skill: q.skill?.trim() || "غير مصنفة",
            percentage: possible ? marks / possible * 100 : 0,
            marks, possible
        };
    });
    const skillRows = {};
    questionRows.forEach(row => {
        if (row.skill === "غير مصنفة") return;
        if (!skillRows[row.skill]) skillRows[row.skill] = { marks: 0, possible: 0 };
        skillRows[row.skill].marks += row.marks;
        skillRows[row.skill].possible += row.possible;
    });

    const questionChart = document.getElementById("question-performance-chart");
    questionChart.innerHTML = questionRows.map(row => `
      <div class="analysis-bar-row">
        <div class="analysis-bar-label"><strong>السؤال ${row.number}</strong><span>${reportEscape(row.skill)}</span></div>
        <div class="analysis-bar-track"><div class="analysis-bar-fill ${row.percentage < 50 ? "bar-low" : row.percentage < 75 ? "bar-mid" : "bar-high"}" style="width:${Math.max(0,Math.min(100,row.percentage))}%"></div></div>
        <strong class="analysis-bar-value">${row.percentage.toFixed(1)}%</strong>
      </div>`).join("");

    const skills = Object.entries(skillRows).map(([name, data]) => ({
        name, percentage: data.possible ? data.marks / data.possible * 100 : 0
    })).sort((a,b) => b.percentage-a.percentage);

    const skillChart = document.getElementById("skill-performance-chart");
    if (!skills.length) {
        skillChart.innerHTML = `<p class="analysis-empty">لم تُحدّد مهارات للأسئلة عند إعداد الامتحان؛ أضيفي المهارة لكل سؤال في الامتحانات القادمة لتظهر المقارنة هنا.</p>`;
    } else {
        skillChart.innerHTML = skills.map(skill => `
          <div class="analysis-bar-row">
            <div class="analysis-bar-label"><strong>${reportEscape(skill.name)}</strong><span>حسب مجموع الأسئلة التابعة للمهارة</span></div>
            <div class="analysis-bar-track"><div class="analysis-bar-fill ${skill.percentage < 50 ? "bar-low" : skill.percentage < 75 ? "bar-mid" : "bar-high"}" style="width:${Math.max(0,Math.min(100,skill.percentage))}%"></div></div>
            <strong class="analysis-bar-value">${skill.percentage.toFixed(1)}%</strong>
          </div>`).join("");
    }

    const sorted = [...questionRows].sort((a,b) => a.percentage-b.percentage);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length-1];
    const insights = [];
    if (weakest) insights.push(`<div class="insight-card insight-warning"><strong>أكثر سؤال يحتاج إلى مراجعة</strong><span>السؤال ${weakest.number} — ${reportEscape(weakest.skill)} (${weakest.percentage.toFixed(1)}% تحصيل)</span></div>`);
    if (strongest) insights.push(`<div class="insight-card insight-positive"><strong>أعلى سؤال تحصيلًا</strong><span>السؤال ${strongest.number} — ${reportEscape(strongest.skill)} (${strongest.percentage.toFixed(1)}% تحصيل)</span></div>`);
    insights.push(`<div class="insight-card"><strong>خطوة مقترحة</strong><span>راجعي إجابات الأسئلة الأقل تحصيلًا، ثم قارني أسباب الإخفاق المسجلة قبل تحديد نشاط علاجي مناسب.</span></div>`);
    document.getElementById("analysis-insights").innerHTML = insights.join("");

    const details = document.getElementById("question-analysis-details");
    details.innerHTML = questionRows.map(row => `
      <article class="analysis-question-card">
        <div><strong>السؤال ${row.number}</strong><span>${reportEscape(row.skill)}</span></div>
        <b>${row.percentage.toFixed(1)}%</b>
        <small>${row.marks.toFixed(2)} من ${row.possible.toFixed(2)}</small>
      </article>`).join("");

    const failureHost = document.getElementById("failure-analysis-content");
    renderFailureAnalysis(exam, failureHost);
    openAnalysisSubtab("results");
}

function renderQuestionAnalysis(exam, resultsArea) {
    // بيانات الأسئلة والمهارات تعرض في الرسوم البيانية ولوحة التفاصيل ضمن لوحة التحليل.
    return;
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

    const studentReasonsSheet = [
        ["اسم الطالبة", "نسبة التحصيل %", "أكثر أسباب الإخفاق تكرارًا", "عدد التكرارات"],
        ...data.students.map(student => [
            student.name,
            Number((Number(student.percentage) || 0).toFixed(2)),
            (student.recurringReasons || []).slice(0, 5).map(item => item.reason).join(" | ") || "لا توجد أسباب مسجلة",
            (student.recurringReasons || []).reduce((sum, item) => sum + item.count, 0)
        ])
    ];
    XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet(studentReasonsSheet),
        "أسباب كل طالبة"
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
            <td>${(student.recurringReasons || []).slice(0, 3).map(item => `${reportEscape(item.reason)} (${item.count})`).join("، ") || "لا توجد أسباب مسجلة"}</td>
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
                    <th>المجموع</th><th>التحصيل</th><th>أسباب الإخفاق المتكررة لدى الطالبة</th>
                </tr></thead>
                <tbody>${studentRows || `<tr><td colspan="${data.questions.length + 4}">لا توجد طالبات محفوظات</td></tr>`}</tbody>
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
    document.getElementById("saved-tables-area").style.display = "none";
    if (!customTableData.headers.length) buildCustomTable();
    document.getElementById("general-table-area").scrollIntoView({ behavior: "smooth", block: "start" });
}

function showExamTable() {
    document.getElementById("general-table-area").style.display = "none";
    document.getElementById("saved-tables-area").style.display = "none";
    document.getElementById("exam-table-area").style.display = "block";
    populateExamTableSelect();
    renderExamResultsTable();
    document.getElementById("exam-table-area").scrollIntoView({ behavior: "smooth", block: "start" });
}

function showSavedTables() {
    document.getElementById("general-table-area").style.display = "none";
    document.getElementById("exam-table-area").style.display = "none";
    document.getElementById("saved-tables-area").style.display = "block";
    renderSavedCustomTables();
    document.getElementById("saved-tables-area").scrollIntoView({ behavior: "smooth", block: "start" });
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

}

// مزامنة لوحة المفاتيح في محرر الجداول وتقارير النتائج.
function installTablesKeyboardNavigation() {
    const host = document.getElementById("tables-area");
    if (!host || host.dataset.keyboardNavigationReady) return;
    host.dataset.keyboardNavigationReady = "true";
    host.addEventListener("keydown", event => {
        const input = event.target.closest?.("table input:not([type=checkbox]):not([type=radio]), table select, table textarea");
        if (input) {
            const table = input.closest("table");
            const rows = Array.from(table?.rows || []);
            const rowElement = input.closest("tr");
            const rowIndex = rows.indexOf(rowElement);
            const cellIndex = Array.from(rowElement?.cells || []).indexOf(input.closest("td, th"));
            if (rowIndex < 0 || cellIndex < 0) return;
            const editable = cell => cell ? Array.from(cell.querySelectorAll("input:not([disabled]),select:not([disabled]),textarea:not([disabled])")) : [];
            let next = null;
            if (["Enter", "ArrowDown", "ArrowUp"].includes(event.key)) {
                event.preventDefault();
                const direction = (event.key === "ArrowUp" || (event.key === "Enter" && event.shiftKey)) ? -1 : 1;
                for (let r = rowIndex + direction; r >= 0 && r < rows.length; r += direction) {
                    const candidates = editable(rows[r].cells[cellIndex]);
                    if (candidates.length) { next = candidates[0]; break; }
                }
                // Enter at the last editable row appends a row in the custom table.
                if (!next && event.key === "Enter" && !event.shiftKey && input.hasAttribute("data-row") && rowIndex === rows.length - 1) {
                    const oldRow = Number(input.dataset.row), col = Number(input.dataset.col);
                    if (typeof addCustomRow === "function") {
                        addCustomRow();
                        next = document.querySelector(`#custom-table-editor [data-row="${oldRow + 1}"][data-col="${col}"]`);
                    }
                }
            } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                // In the RTL table, Left advances to the next column.
                const direction = event.key === "ArrowLeft" ? 1 : -1;
                for (let c = cellIndex + direction; c >= 0 && c < rowElement.cells.length; c += direction) {
                    const candidates = editable(rowElement.cells[c]);
                    if (candidates.length) { next = candidates[0]; break; }
                }
            }
            if (next) { next.focus(); next.select?.(); }
            return;
        }
        if (event.target.closest?.("button")) return;
        const cell = event.target.closest?.(".table-scroll .emy-data-table td, .table-scroll .emy-data-table th");
        if (!cell || !["Enter", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
        const table = cell.closest("table");
        const rows = Array.from(table.rows);
        const rowIndex = rows.indexOf(cell.parentElement);
        const colIndex = Array.from(cell.parentElement.cells).indexOf(cell);
        let nextRow = rowIndex, nextCol = colIndex;
        if (event.key === "ArrowUp" || (event.key === "Enter" && event.shiftKey)) nextRow--;
        if (event.key === "ArrowDown" || (event.key === "Enter" && !event.shiftKey)) nextRow++;
        if (event.key === "ArrowLeft") nextCol++;
        if (event.key === "ArrowRight") nextCol--;
        const next = rows[nextRow]?.cells[nextCol];
        if (next) { event.preventDefault(); next.tabIndex = 0; next.focus(); }
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
    showGeneralTable();
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

function exportSavedCustomTableExcel(id) {
    const table = savedCustomTables.find(item => String(item.id) === String(id));
    if (!table) return;
    if (typeof XLSX === "undefined") { alert("تصدير Excel يحتاج اتصالًا بالإنترنت لتحميل المكتبة."); return; }
    const rows = [["م", ...table.headers], ...table.rows.map((row, index) => [index + 1, ...row])];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["عنوان الجدول", table.title || "جدول"], [], ...rows]), "الجدول");
    XLSX.writeFile(wb, `${String(table.title || "جدول").replace(/[\\/:*?"<>|]/g, "_")}.xlsx`);
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
        const print = document.createElement("button");
        print.textContent = "طباعة / PDF";
        print.className = "secondary-button";
        print.onclick = () => printHtmlTable(table.title || "جدول", customTableAsHtml(table));
        const excel = document.createElement("button");
        excel.textContent = "Excel";
        excel.className = "secondary-button";
        excel.onclick = () => exportSavedCustomTableExcel(table.id);
        const remove = document.createElement("button");
        remove.textContent = "حذف";
        remove.className = "secondary-button";
        remove.onclick = () => deleteCustomTable(table.id);
        card.append(heading, details, edit, print, excel, remove);
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
    area.querySelectorAll(".emy-data-table td, .emy-data-table th").forEach((cell, index) => {
        cell.tabIndex = index === 0 ? 0 : -1;
    });
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


// =========================================================
// EMY - قوائم الطالبات والتصحيح الجماعي (يعمل محليًا حاليًا)
// =========================================================
let emyRosters = JSON.parse(localStorage.getItem("emyRosters") || "[]");
let bulkReasonTarget = null;

function normalizeRosterNames(text) {
    return [...new Set(String(text || "").split(/\r?\n|,/).map(x => x.trim()).filter(Boolean))];
}

function renderRosterSelect(selectedId = "") {
    const select = document.getElementById("roster-select");
    if (!select) return;
    select.innerHTML = '<option value="">اختاري قائمة محفوظة (اختياري)</option>';
    emyRosters.forEach(roster => {
        const option = document.createElement("option");
        option.value = String(roster.id);
        option.textContent = `${roster.name} (${roster.names.length})`;
        if (String(roster.id) === String(selectedId)) option.selected = true;
        select.appendChild(option);
    });
}

function loadSelectedRoster() {
    const id = document.getElementById("roster-select")?.value;
    const roster = emyRosters.find(item => String(item.id) === String(id));
    if (!roster) return;
    document.getElementById("roster-names").value = roster.names.join("\n");
    const classInput = document.getElementById("exam-class");
    if (classInput && !classInput.value.trim()) classInput.value = roster.name;
    const status = document.getElementById("roster-status");
    if (status) status.textContent = `تم تحميل ${roster.names.length} اسمًا.`;
}

function saveRoster() {
    const names = normalizeRosterNames(document.getElementById("roster-names")?.value);
    if (!names.length) {
        alert("أدخلي أسماء الطالبات أولًا.");
        return;
    }
    const className = document.getElementById("exam-class")?.value.trim();
    const name = className || prompt("اكتبي اسم القائمة أو الصف:");
    if (!name || !name.trim()) return;
    const existing = emyRosters.find(item => item.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) {
        if (!confirm("توجد قائمة بالاسم نفسه. هل تريدين استبدال أسماءها؟")) return;
        existing.names = names;
        existing.updatedAt = new Date().toISOString();
        renderRosterSelect(existing.id);
    } else {
        const roster = { id: Date.now(), name: name.trim(), names, updatedAt: new Date().toISOString() };
        emyRosters.push(roster);
        renderRosterSelect(roster.id);
    }
    localStorage.setItem("emyRosters", JSON.stringify(emyRosters));
    const status = document.getElementById("roster-status");
    if (status) status.textContent = `حُفظت القائمة وفيها ${names.length} طالبة على هذا الجهاز والمتصفح.`;
}

function importRosterExcel(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (typeof XLSX === "undefined") {
        alert("تعذر تحميل أداة Excel. اتصلي بالإنترنت ثم أعيدي فتح التطبيق.");
        event.target.value = "";
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const workbook = XLSX.read(e.target.result, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            const names = rows.map(row => String(row[0] ?? "").trim()).filter(Boolean);
            const cleaned = names.filter((name, index) => !(index === 0 && /^(الاسم|اسم الطالبة|student name|name)$/i.test(name)));
            document.getElementById("roster-names").value = [...new Set(cleaned)].join("\n");
            const status = document.getElementById("roster-status");
            if (status) status.textContent = `تم استيراد ${new Set(cleaned).size} اسمًا من العمود الأول في الملف.`;
        } catch (error) {
            alert("لم أستطع قراءة الملف. تأكدي أنه ملف Excel سليم.");
        }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = "";
}

function getSelectedGradingMode() {
    return document.querySelector('input[name="grading-mode"]:checked')?.value || "individual";
}

function getRosterNamesForExam() {
    return normalizeRosterNames(document.getElementById("roster-names")?.value || "");
}

function makeEmptyStudent(name, questions) {
    return {
        name,
        questions: questions.map(q => ({
            questionNumber: q.number, maxMark: q.maxMark, skill: q.skill || "",
            mark: "", achievementPercentage: 0, failurePercentage: 100,
            reasons: [], otherReason: ""
        })),
        totalMark: 0, maxTotal: questions.reduce((s, q) => s + Number(q.maxMark), 0),
        percentage: 0, failurePercentage: 100
    };
}

function startBulkGrading() {
    const area = document.getElementById("student-entry-area");
    area.innerHTML = `
        <h2>التصحيح الجماعي</h2>
        <p>أدخلي العلامات في الجدول. يمكنك تعديل أسباب الإخفاق لكل طالبة وسؤال من لوحة الأسباب.</p>
        <div class="bulk-toolbar">
            <label>سبب يطبّق على الطالبات المحددات للسؤال:
                <select id="bulk-apply-question"></select>
            </label>
            <select id="bulk-apply-reason">
                <option value="">اختاري سببًا</option>
                <option>ضعف فهم المفهوم</option>
                <option>عدم إتقان المهارة</option>
                <option>خطأ في خطوات الحل</option>
                <option>خطأ حسابي</option>
                <option>عدم فهم المطلوب</option>
                <option>عدم إكمال الإجابة</option>
            </select>
            <button type="button" onclick="applyBulkReason()">تطبيق السبب على المحددات</button>
        </div>
        <div id="bulk-grade-summary" class="bulk-summary"></div>
        <div id="bulk-grade-table" class="bulk-table-wrap"></div>
        <div id="bulk-reason-editor"></div>
        <div class="bulk-row-actions">
            <button type="button" onclick="saveBulkGrading()">حفظ جميع العلامات</button>
            <button type="button" class="secondary-button" onclick="finishBulkGrading()">إنهاء التصحيح</button>
        </div>
    `;
    const questionSelect = document.getElementById("bulk-apply-question");
    currentExam.questions.forEach((q, i) => {
        const option = document.createElement("option");
        option.value = String(i);
        option.textContent = `السؤال ${q.number}`;
        questionSelect.appendChild(option);
    });
    renderBulkGradeTable();
    area.scrollIntoView({ behavior: "smooth" });
}

function renderBulkGradeTable() {
    const area = document.getElementById("bulk-grade-table");
    if (!area || !currentExam) return;
    const questions = currentExam.questions || [];
    const students = currentExam.students || [];
    let html = `<table class="bulk-grade-table"><thead><tr>
        <th>تحديد</th><th>اسم الطالبة</th>${questions.map(q => `<th>س${q.number}<br><small>من ${q.maxMark}</small></th>`).join("")}
        <th>المجموع</th><th>النسبة</th><th>الأسباب</th></tr></thead><tbody>`;
    students.forEach((student, si) => {
        const qResults = student.questions || [];
        const total = qResults.reduce((sum, q) => sum + (Number(q.mark) || 0), 0);
        const maxTotal = questions.reduce((sum, q) => sum + Number(q.maxMark), 0);
        html += `<tr><td><input class="bulk-student-select" type="checkbox" data-student-select="${si}" aria-label="تحديد ${escapeTableHtml(student.name)}"></td>
            <td>${escapeTableHtml(student.name)}</td>`;
        questions.forEach((q, qi) => {
            const mark = qResults[qi]?.mark ?? "";
            html += `<td><input type="number" min="0" max="${q.maxMark}" step="0.5"
                value="${mark === null ? "" : mark}" data-bulk-student="${si}" data-bulk-question="${qi}"
                oninput="updateBulkRowSummary(${si})" aria-label="علامة ${escapeTableHtml(student.name)} في السؤال ${q.number}">
                <small class="bulk-cell-error" id="bulk-error-${si}-${qi}" aria-live="polite"></small></td>`;
        });
        html += `<td id="bulk-total-${si}">${total.toFixed(2)}</td>
            <td id="bulk-percent-${si}">${maxTotal ? (total / maxTotal * 100).toFixed(1) : "0.0"}%</td>
            <td>${questions.map((q, qi) => `<button type="button" class="secondary-button" onclick="editBulkReasons(${si},${qi})">س${q.number}</button>`).join(" ")}</td></tr>`;
    });
    html += "</tbody></table>";
    area.innerHTML = html;
    updateBulkSummary();
}

function updateBulkRowSummary(si) {
    if (!currentExam) return;
    let total = 0, max = 0;
    currentExam.questions.forEach((q, qi) => {
        max += Number(q.maxMark) || 0;
        const input = document.querySelector(`[data-bulk-student="${si}"][data-bulk-question="${qi}"]`);
        total += Number(input?.value) || 0;
    });
    const totalCell = document.getElementById(`bulk-total-${si}`);
    const percentCell = document.getElementById(`bulk-percent-${si}`);
    if (totalCell) totalCell.textContent = total.toFixed(2);
    if (percentCell) percentCell.textContent = max ? `${(total / max * 100).toFixed(1)}%` : "0%";
    updateBulkSummary();
}

function updateBulkSummary() {
    if (!currentExam) return;
    const students = currentExam.students || [];
    const maxTotal = currentExam.questions.reduce((s, q) => s + Number(q.maxMark), 0);
    const values = students.map((student, si) => {
        let total = 0;
        currentExam.questions.forEach((q, qi) => {
            const input = document.querySelector(`[data-bulk-student="${si}"][data-bulk-question="${qi}"]`);
            total += Number(input?.value) || 0;
        });
        return total;
    });
    const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const high = values.length ? Math.max(...values) : 0;
    const area = document.getElementById("bulk-grade-summary");
    if (area) area.innerHTML = `<span>عدد الطالبات: ${students.length}</span><span>العلامة الكلية: ${maxTotal}</span><span>المعدل الحالي: ${average.toFixed(2)}</span><span>أعلى علامة: ${high.toFixed(2)}</span>`;
}

function editBulkReasons(studentIndex, questionIndex) {
    const student = currentExam.students[studentIndex];
    const result = student.questions[questionIndex];
    bulkReasonTarget = { studentIndex, questionIndex };
    const presets = ["ضعف فهم المفهوم", "عدم إتقان المهارة", "خطأ في خطوات الحل", "خطأ حسابي", "عدم فهم المطلوب", "عدم إكمال الإجابة"];
    const selected = result.reasons || [];
    const panel = document.getElementById("bulk-reason-editor");
    panel.innerHTML = `<div class="bulk-reason-panel">
        <h3>أسباب الإخفاق — ${escapeTableHtml(student.name)} — السؤال ${questionIndex + 1}</h3>
        <p>اختاري سببًا واحدًا أو أكثر. العلامة وحدها لا تحدد سبب الإخفاق؛ الاختيار هنا يدوي.</p>
        <div class="bulk-reason-options">${presets.map((reason, i) => `<label><input type="checkbox" class="bulk-reason-check" value="${reason}" ${selected.includes(reason) ? "checked" : ""}>${reason}</label>`).join("")}
        <label><input type="checkbox" id="bulk-other-toggle" ${result.otherReason ? "checked" : ""}>أسباب أخرى</label></div>
        <textarea id="bulk-other-text" rows="2" placeholder="اكتبي السبب الآخر">${escapeTableHtml(result.otherReason || "")}</textarea>
        <div class="bulk-row-actions"><button type="button" onclick="saveBulkReasons()">حفظ الأسباب</button><button type="button" class="secondary-button" onclick="document.getElementById('bulk-reason-editor').innerHTML=''">إغلاق</button></div>
    </div>`;
    document.getElementById("bulk-other-text").style.display = result.otherReason ? "block" : "none";
    document.getElementById("bulk-other-toggle").addEventListener("change", e => {
        document.getElementById("bulk-other-text").style.display = e.target.checked ? "block" : "none";
    });
}

function saveBulkReasons() {
    if (!bulkReasonTarget) return;
    const { studentIndex, questionIndex } = bulkReasonTarget;
    const result = currentExam.students[studentIndex].questions[questionIndex];
    result.reasons = Array.from(document.querySelectorAll(".bulk-reason-check:checked")).map(x => x.value);
    result.otherReason = document.getElementById("bulk-other-toggle").checked
        ? document.getElementById("bulk-other-text").value.trim() : "";
    bulkReasonTarget = null;
    document.getElementById("bulk-reason-editor").innerHTML = "<p>تم حفظ أسباب الإخفاق في الذاكرة الحالية. اضغطي حفظ جميع العلامات لحفظ الامتحان.</p>";
}

function applyBulkReason() {
    const questionIndex = Number(document.getElementById("bulk-apply-question").value);
    const reason = document.getElementById("bulk-apply-reason").value;
    const selected = Array.from(document.querySelectorAll("[data-student-select]:checked"))
        .map(input => Number(input.dataset.studentSelect));
    if (!reason) { alert("اختاري سببًا أولًا."); return; }
    if (!selected.length) { alert("حددي طالبة واحدة على الأقل."); return; }
    selected.forEach(si => {
        const result = currentExam.students[si].questions[questionIndex];
        result.reasons = [...new Set([...(result.reasons || []), reason])];
    });
    alert(`تم تطبيق السبب على ${selected.length} طالبة. احفظي الامتحان لتثبيت التغييرات.`);
}

function saveBulkGrading() {
    if (!currentExam) return;
    const students = currentExam.students || [];
    const maxTotal = currentExam.questions.reduce((s, q) => s + Number(q.maxMark), 0);
    for (let si = 0; si < students.length; si++) {
        let total = 0;
        const questionResults = [];
        for (let qi = 0; qi < currentExam.questions.length; qi++) {
            const q = currentExam.questions[qi];
            const input = document.querySelector(`[data-bulk-student="${si}"][data-bulk-question="${qi}"]`);
            if (!input || input.value === "") {
                alert(`أدخلي علامة ${students[si].name} في السؤال ${qi + 1}.`);
                input?.focus();
                return false;
            }
            const mark = Number(input.value);
            if (!Number.isFinite(mark) || mark < 0 || mark > Number(q.maxMark)) {
                validateBulkCell(input);
                alert(`علامة ${students[si].name} في السؤال ${qi + 1} يجب أن تكون بين 0 و${q.maxMark}.`);
                input.focus();
                return false;
            }
            const old = students[si].questions[qi] || {};
            const achievement = q.maxMark ? mark / q.maxMark * 100 : 0;
            questionResults.push({
                questionNumber: q.number, maxMark: q.maxMark, skill: q.skill || "",
                mark, achievementPercentage: achievement, failurePercentage: 100 - achievement,
                reasons: old.reasons || [], otherReason: old.otherReason || ""
            });
            total += mark;
        }
        students[si] = {
            name: students[si].name, questions: questionResults, totalMark: total,
            maxTotal, percentage: maxTotal ? total / maxTotal * 100 : 0,
            failurePercentage: maxTotal ? 100 - total / maxTotal * 100 : 0
        };
    }
    currentExam.status = "قيد التصحيح";
    saveCurrentExam();
    renderSavedExams();
    if (currentAnalysisExamId === currentExam.id) analyzeExam(currentExam.id);
    alert("تم حفظ علامات جميع الطالبات وأسباب الإخفاق.");
    return true;
}

function finishBulkGrading() {
    if (!saveBulkGrading()) return;
    if (!currentExam) return;
    currentExam.status = "مكتمل";
    saveCurrentExam();
    renderSavedExams();
    const area = document.getElementById("student-entry-area");
    area.innerHTML = `<div class="bulk-reason-panel"><h2>اكتمل تصحيح الامتحان</h2><p>عدد الطالبات: ${currentExam.students.length}</p><p>تم حفظ النتائج على هذا الجهاز.</p><button onclick="openSavedExam(${Number(currentExam.id)})">العودة إلى الامتحان</button></div>`;
}

function showStudentForm() {
    const area = document.getElementById("student-entry-area");
    editingStudentIndex = null;
    const studentNumber = currentExam.students.length + 1;
    area.innerHTML = `
        <h2>تصحيح الامتحان</h2>
        <p>الامتحان: ${escapeTableHtml(currentExam.name)}</p>
        <p>الصف والشعبة: ${escapeTableHtml(currentExam.className)}</p>
        <h3 id="student-form-title">الطالبة رقم ${studentNumber}</h3>
        <label>اسم الطالبة</label>
        <input type="text" id="student-name" placeholder="أدخلي اسم الطالبة">
        <h3>علامات الأسئلة وأسباب الإخفاق</h3>
        <div id="student-questions"></div>
        <button onclick="saveStudent()">حفظ والانتقال للطالبة التالية</button>
        <button onclick="finishGrading()">إنهاء التصحيح</button>
        <div class="question-item"><h3>الطالبات المحفوظات</h3><div id="saved-students-list"></div></div>
    `;
    renderSavedStudents();
}

function openSavedExam(examId) {
    const exam = exams.find(item => item.id === examId);
    if (!exam) { alert("لم يتم العثور على الامتحان."); return; }
    currentExam = exam;
    currentStudentIndex = exam.students.length;
    if (exam.gradingMode === "bulk") {
        startBulkGrading();
        return;
    }
    showStudentForm();
    loadStudentQuestions();
    document.getElementById("student-entry-area").scrollIntoView({ behavior: "smooth" });
}

// إعادة تحميل القوائم عند فتح الصفحة
renderRosterSelect();
renderSavedExams();



// اختيار مسار التصحيح بحسب النمط المحدد في شاشة الإعداد.
function startGrading() {
    const maxInputs = document.querySelectorAll(".max-mark");
    const skillInputs = document.querySelectorAll(".question-skill");
    const examName = document.getElementById("exam-name").value.trim();
    const examClass = document.getElementById("exam-class").value.trim();
    const examDate = document.getElementById("exam-date").value;
    const gradingMode = getSelectedGradingMode();

    if (!examName || !examClass) {
        alert("يرجى إدخال اسم الامتحان والصف والشعبة.");
        return;
    }

    const questions = [];
    for (let i = 0; i < maxInputs.length; i++) {
        const max = Number(maxInputs[i].value);
        if (maxInputs[i].value === "" || !Number.isFinite(max) || max <= 0) {
            alert("يرجى إدخال العلامة القصوى لكل سؤال.");
            maxInputs[i].focus();
            return;
        }
        questions.push({
            number: i + 1,
            maxMark: max,
            skill: skillInputs[i]?.value || ""
        });
    }

    const names = getRosterNamesForExam();
    if (gradingMode === "bulk" && names.length === 0) {
        alert("أدخلي أسماء الطالبات أو حمّلي قائمة محفوظة قبل اختيار التصحيح الجماعي.");
        document.getElementById("roster-names")?.focus();
        return;
    }

    currentExam = {
        id: Date.now(),
        name: examName,
        className: examClass,
        date: examDate,
        questions,
        students: gradingMode === "bulk" ? names.map(name => makeEmptyStudent(name, questions)) : [],
        status: "قيد التصحيح",
        currentStudentIndex: 0,
        gradingMode
    };
    currentStudentIndex = 0;
    editingStudentIndex = null;
    saveCurrentExam();

    if (gradingMode === "bulk") {
        startBulkGrading();
    } else {
        showStudentForm();
        loadStudentQuestions();
        document.getElementById("student-entry-area").scrollIntoView({ behavior: "smooth" });
    }
}


// =========================================================
// EMY v2: تنقّل جانبي وتبويبات داخلية وتنبيهات العلامات
// =========================================================
function openEMYPage(pageId) {
    document.querySelectorAll(".emy-page").forEach(page => {
        page.style.display = page.id === pageId ? "block" : "none";
    });
    document.querySelectorAll(".sidebar-link").forEach(link => {
        link.classList.toggle("active", link.dataset.page === pageId);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function openExamSubtab(tab) {
    const setup = document.getElementById("exam-setup-panel");
    const grading = document.getElementById("grading-panel");
    if (setup) setup.style.display = tab === "setup" ? "block" : "none";
    if (grading) grading.style.display = tab === "grading" ? "block" : "none";
    document.querySelectorAll("#exam-tabs .inner-tab").forEach((button, index) => {
        button.classList.toggle("active", (index === 0 && tab === "setup") || (index === 1 && tab === "grading"));
    });
}

function openAnalysisSubtab(tab) {
    const choose = document.getElementById("analysis-choose-panel");
    const results = document.getElementById("analysis-results-panel");
    if (choose) choose.style.display = tab === "choose" ? "block" : "none";
    if (results) results.style.display = tab === "results" ? "block" : "none";
    const buttons = document.querySelectorAll("#analysis-area .section-tabs .inner-tab");
    buttons.forEach((button, index) => button.classList.toggle("active", (index === 0 && tab === "choose") || (index === 1 && tab === "results")));
}

function openActivitiesSubtab(tab) {
    const create = document.getElementById("activity-create-panel");
    const saved = document.getElementById("activity-saved-panel");
    if (create) create.style.display = tab === "create" ? "block" : "none";
    if (saved) saved.style.display = tab === "saved" ? "block" : "none";
    const buttons = document.querySelectorAll("#activities-area .section-tabs .inner-tab");
    buttons.forEach((button, index) => button.classList.toggle("active", (index === 0 && tab === "create") || (index === 1 && tab === "saved")));
}

function showExamSetup() {
    openEMYPage("exam-page");
    const examSection = document.getElementById("exam-setup");
    if (examSection) examSection.style.display = "block";
    openExamSubtab("setup");
    const area = document.getElementById("student-entry-area");
    if (area && !currentExam) area.innerHTML = "";
}

function showSavedExamsPage() {
    openEMYPage("saved-exams-page");
    renderSavedExams();
}

function showAnalysis() {
    openEMYPage("analysis-page");
    const analysisSection = document.getElementById("analysis-area");
    if (analysisSection) analysisSection.style.display = "block";
    renderAnalysisExams();
    openAnalysisSubtab("choose");
    if (currentAnalysisExamId) {
        const exam = exams.find(item => item.id === currentAnalysisExamId);
        if (exam) {
            const oldAnalyze = window.__emyOriginalAnalyzeExam || analyzeExam;
            oldAnalyze(currentAnalysisExamId);
            openAnalysisSubtab("results");
        }
    }
}

function showActivities() {
    openEMYPage("activities-page");
    const activitiesSection = document.getElementById("activities-area");
    if (activitiesSection) activitiesSection.style.display = "block";
    renderSavedActivities();
    openActivitiesSubtab("create");
}

function showTables() {
    openEMYPage("tables-page");
    const tablesSection = document.getElementById("tables-area");
    if (tablesSection) tablesSection.style.display = "block";
    document.getElementById("general-table-area").style.display = "none";
    document.getElementById("exam-table-area").style.display = "none";
    document.getElementById("saved-tables-area").style.display = "none";
    renderSavedCustomTables();
    populateExamTableSelect();
    installTablesKeyboardNavigation();
}

function showQuestionMarkError(input, message) {
    if (!input) return;
    const box = input.closest(".question-item");
    const error = box?.querySelector(".question-error-message");
    if (error) error.textContent = message || "";
    input.classList.toggle("mark-invalid", Boolean(message));
    if (!message) input.removeAttribute("aria-invalid");
    else input.setAttribute("aria-invalid", "true");
}

function calculateStudentResults() {
    if (!currentExam) return;
    const marks = document.querySelectorAll(".student-question-mark");
    let total = 0, maxTotal = 0, allValid = true;
    marks.forEach((input, index) => {
        const q = currentExam.questions[index];
        const max = Number(q.maxMark);
        maxTotal += max;
        const value = input.value;
        const percentage = input.closest(".question-item")?.querySelector(".question-percentage");
        if (value === "") {
            showQuestionMarkError(input, "");
            if (percentage) percentage.textContent = "بانتظار إدخال العلامة";
            allValid = false;
            return;
        }
        const mark = Number(value);
        if (!Number.isFinite(mark) || mark < 0 || mark > max) {
            showQuestionMarkError(input, `تنبيه: العلامة يجب أن تكون من 0 إلى ${max} فقط.`);
            if (percentage) percentage.textContent = "علامة غير صحيحة";
            allValid = false;
            return;
        }
        showQuestionMarkError(input, "");
        total += mark;
        if (percentage) percentage.textContent = `التحصيل: ${(mark / max * 100).toFixed(1)}% | الإخفاق: ${(100 - mark / max * 100).toFixed(1)}%`;
    });
    const totalEl = document.getElementById("student-total");
    const percentEl = document.getElementById("student-percentage");
    const failureEl = document.getElementById("student-failure-percentage");
    if (totalEl) totalEl.textContent = `مجموع العلامات: ${total.toFixed(2)} / ${maxTotal.toFixed(2)}`;
    if (percentEl) percentEl.textContent = allValid ? `نسبة التحصيل: ${(total / maxTotal * 100).toFixed(1)}%` : "نسبة التحصيل: بانتظار إدخال علامات صحيحة";
    if (failureEl) failureEl.textContent = allValid ? `نسبة الإخفاق: ${(100 - total / maxTotal * 100).toFixed(1)}%` : "نسبة الإخفاق: —";
}

function renderSavedStudents() {
    const area = document.getElementById("saved-students-list");
    if (!area) return;
    area.innerHTML = "";
    const students = currentExam?.students || [];
    if (!students.length) {
        area.textContent = "لا توجد طالبات محفوظات حتى الآن.";
        return;
    }
    students.forEach((student, index) => {
        const row = document.createElement("div");
        row.className = "saved-student-row";
        const name = document.createElement("span");
        name.textContent = `${index + 1}. ${student.name}`;
        const edit = document.createElement("button");
        edit.type = "button";
        edit.textContent = "تعديل العلامات";
        edit.onclick = () => editStudent(index);
        row.append(name, edit);
        area.appendChild(row);
    });
}

const __emyOriginalShowStudentForm = showStudentForm;
showStudentForm = function () {
    __emyOriginalShowStudentForm();
    openExamSubtab("grading");
};

const __emyOriginalAnalyzeExam = analyzeExam;
window.__emyOriginalAnalyzeExam = __emyOriginalAnalyzeExam;
analyzeExam = function (examId) {
    __emyOriginalAnalyzeExam(examId);
    openAnalysisSubtab("results");
};

const __emyOriginalOpenSavedExam = openSavedExam;
openSavedExam = function (examId) {
    openEMYPage("exam-page");
    __emyOriginalOpenSavedExam(examId);
    openExamSubtab("grading");
};

const __emyOriginalStartGrading = startGrading;
startGrading = function () {
    const beforeId = currentExam?.id;
    __emyOriginalStartGrading();
    if (currentExam && currentExam.id !== beforeId) {
        openEMYPage("exam-page");
        openExamSubtab("grading");
    }
};

const __emyOriginalStartBulkGrading = startBulkGrading;
startBulkGrading = function () {
    __emyOriginalStartBulkGrading();
    openEMYPage("exam-page");
    openExamSubtab("grading");
};

function validateBulkCell(input) {
    if (!input || !currentExam) return true;
    const si = Number(input.dataset.bulkStudent);
    const qi = Number(input.dataset.bulkQuestion);
    const q = currentExam.questions[qi];
    const error = document.getElementById(`bulk-error-${si}-${qi}`);
    const max = Number(q.maxMark);
    let message = "";
    if (input.value !== "") {
        const mark = Number(input.value);
        if (!Number.isFinite(mark) || mark < 0 || mark > max) {
            message = `أقصى علامة ${max}`;
        }
    }
    if (error) error.textContent = message;
    input.classList.toggle("mark-invalid", Boolean(message));
    return !message;
}

function updateBulkRowSummary(si) {
    if (!currentExam) return;
    let total = 0, max = 0;
    let valid = true;
    currentExam.questions.forEach((q, qi) => {
        max += Number(q.maxMark) || 0;
        const input = document.querySelector(`[data-bulk-student="${si}"][data-bulk-question="${qi}"]`);
        if (!validateBulkCell(input)) valid = false;
        total += Number(input?.value) || 0;
    });
    const totalCell = document.getElementById(`bulk-total-${si}`);
    const percentCell = document.getElementById(`bulk-percent-${si}`);
    if (totalCell) totalCell.textContent = valid ? total.toFixed(2) : "تحققي من العلامات";
    if (percentCell) percentCell.textContent = valid && max ? `${(total / max * 100).toFixed(1)}%` : "—";
    updateBulkSummary();
}

const __emyOriginalSaveStudent = saveStudent;
saveStudent = function () {
    const inputs = document.querySelectorAll(".student-question-mark");
    for (const input of inputs) {
        if (input.value === "") {
            showQuestionMarkError(input, "يرجى إدخال علامة هذا السؤال.");
            input.focus();
            return;
        }
        const index = Number(input.dataset.question);
        const max = Number(currentExam.questions[index].maxMark);
        const mark = Number(input.value);
        if (!Number.isFinite(mark) || mark < 0 || mark > max) {
            showQuestionMarkError(input, `لا يمكن حفظ علامة أعلى من ${max}. صححي العلامة أولًا.`);
            input.focus();
            return;
        }
    }
    __emyOriginalSaveStudent();
};

// فتح الواجهة الرئيسية افتراضيًا عند التحميل.
document.addEventListener("DOMContentLoaded", () => {
    openEMYPage("home-page");
    openExamSubtab("setup");
    openAnalysisSubtab("choose");
    openActivitiesSubtab("create");
});


// =========================================================
// EMY V4: لوحة أسباب الإخفاق الإنجليزية + التنقل بلوحة المفاتيح
// =========================================================
const EMY_ENGLISH_FAILURE_REASONS = [
    "ضعف حصيلة المفردات (Vocabulary)",
    "عدم إتقان القاعدة النحوية (Grammar)",
    "صعوبة فهم المقروء (Reading Comprehension)",
    "أخطاء في بناء الجملة وترتيب الكلمات (Sentence Structure)",
    "أخطاء إملائية (Spelling)",
    "أخطاء في علامات الترقيم (Punctuation)",
    "عدم إتقان الأزمنة (Verb Tenses)",
    "عدم فهم تعليمات السؤال",
    "عدم القدرة على استنتاج المعنى من السياق",
    "إجابة غير مكتملة أو خارج المطلوب",
    "ضعف فهم النص المسموع (Listening Comprehension)",
    "صعوبة التعبير الكتابي (Writing Skills)",
    "أخطاء في استخدام حروف الجر (Prepositions)",
    "عدم إتقان تصريف الأفعال (Verb Forms)",
    "الخلط بين المفرد والجمع (Singular / Plural)",
    "ضعف مهارة الترجمة (Translation)"
];

function emyEscape(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[char]));
}

function getStudentReasonFrequency(student) {
    const counts = {};
    (student.questions || []).forEach(question => {
        (question.reasons || []).forEach(reason => {
            if (reason && reason !== "أسباب أخرى") counts[reason] = (counts[reason] || 0) + 1;
        });
        const other = String(question.otherReason || "").trim();
        if (other) counts[other] = (counts[other] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));
}

function emyReasonSummaryHTML(student, questionIndex) {
    const result = student.questions?.[questionIndex] || {};
    const reasons = [...(result.reasons || [])].filter(x => x && x !== "أسباب أخرى");
    if (result.otherReason?.trim()) reasons.push(result.otherReason.trim());
    if (!reasons.length) return `<small class="bulk-reason-summary is-empty">لا يوجد سبب مسجل</small>`;
    return `<small class="bulk-reason-summary">${reasons.map(emyEscape).join("، ")}</small>`;
}

// English-oriented reason choices for individual marking, preserving existing data classes.
const __emyV3LoadStudentQuestions = loadStudentQuestions;
loadStudentQuestions = function () {
    __emyV3LoadStudentQuestions();
    document.querySelectorAll("#student-questions .question-item").forEach(questionBox => {
        const holder = questionBox.querySelector(".failure-reasons");
        if (!holder) return;
        const previousChecks = Array.from(holder.querySelectorAll(".failure-reason:checked")).map(x => x.value);
        const previousOther = holder.querySelector(".other-reason-text")?.value || "";
        holder.innerHTML = `
            <div class="english-reason-grid">
              ${EMY_ENGLISH_FAILURE_REASONS.map(reason => `
                <label><input type="checkbox" class="failure-reason" value="${emyEscape(reason)}" ${previousChecks.includes(reason) ? "checked" : ""}>${emyEscape(reason)}</label>
              `).join("")}
              <label class="english-other-label">
                <input type="checkbox" class="failure-reason other-reason-toggle" value="أسباب أخرى"
                  ${previousChecks.includes("أسباب أخرى") || previousOther ? "checked" : ""}
                  onchange="toggleOtherReason(this)"> أسباب أخرى
              </label>
            </div>
            <div class="other-reason-box" style="display:${previousChecks.includes("أسباب أخرى") || previousOther ? "block" : "none"};">
              <label>وضّحي السبب الآخر</label>
              <textarea class="other-reason-text" placeholder="اكتبي السبب المرتبط بإجابة الطالبة...">${emyEscape(previousOther)}</textarea>
            </div>`;
    });
};

// Keep the saved-student list compact, while showing the reasons recorded for each student.
const __emyV3RenderSavedStudents = renderSavedStudents;
renderSavedStudents = function () {
    __emyV3RenderSavedStudents();
    const area = document.getElementById("saved-students-list");
    if (!area || !currentExam) return;
    Array.from(area.querySelectorAll(".saved-student-row")).forEach((row, index) => {
        const student = currentExam.students[index];
        if (!student) return;
        const reasons = getStudentReasonFrequency(student);
        const detail = document.createElement("small");
        detail.className = "saved-student-reasons";
        detail.textContent = reasons.length
            ? "أبرز الأسباب: " + reasons.slice(0, 3).map(item => `${item.reason} (${item.count})`).join("، ")
            : "لم تُسجل أسباب إخفاق بعد.";
        row.appendChild(detail);
    });
};

// Bulk grading redesigned: reason action is attached to each student/question cell.
startBulkGrading = function () {
    const area = document.getElementById("student-entry-area");
    area.innerHTML = `
      <h2>التصحيح الجماعي</h2>
      <p>استخدمي الأسهم وEnter للتنقل بين العلامات. ويمكنك فتح أسباب الإخفاق لكل طالبة بجانب علامتها.</p>
      <div class="bulk-toolbar">
        <label>السؤال المراد تطبيق السبب عليه
          <select id="bulk-apply-question"></select>
        </label>
        <label>السبب المشترك
          <select id="bulk-apply-reason">
            <option value="">اختاري سببًا</option>
            ${EMY_ENGLISH_FAILURE_REASONS.map(reason => `<option value="${emyEscape(reason)}">${emyEscape(reason)}</option>`).join("")}
            <option value="أسباب أخرى">أسباب أخرى (كتابة يدوية)</option>
          </select>
        </label>
        <div id="bulk-shared-other-wrap" class="bulk-shared-other-wrap" style="display:none;">
          <label for="bulk-shared-other-text">اكتبي السبب الذي سيُطبّق على الطالبات المحددات</label>
          <textarea id="bulk-shared-other-text" rows="2" placeholder="اكتبي السبب المشترك هنا..."></textarea>
        </div>
        <button type="button" onclick="applyBulkReason()">تطبيق على الطالبات المحددات</button>
        <small>الأسباب الفردية تُعدّل من زر «الأسباب» بجانب علامة كل طالبة، ولا تتأثر إن لم تحددي الطالبة.</small>
      </div>
      <div id="bulk-grade-summary" class="bulk-summary"></div>
      <div id="bulk-grade-table" class="bulk-table-wrap"></div>
      <div id="bulk-reason-editor"></div>
      <div class="bulk-row-actions">
        <button type="button" onclick="saveBulkGrading()">حفظ جميع العلامات</button>
        <button type="button" class="secondary-button" onclick="finishBulkGrading()">إنهاء التصحيح</button>
      </div>`;
    const questionSelect = document.getElementById("bulk-apply-question");
    currentExam.questions.forEach((q, i) => {
        const option = document.createElement("option");
        option.value = String(i);
        option.textContent = `السؤال ${q.number}`;
        questionSelect.appendChild(option);
    });
    document.getElementById("bulk-apply-reason").addEventListener("change", event => {
        document.getElementById("bulk-shared-other-wrap").style.display =
            event.target.value === "أسباب أخرى" ? "block" : "none";
    });
    renderBulkGradeTable();
    area.scrollIntoView({ behavior: "smooth" });
};

renderBulkGradeTable = function () {
    const area = document.getElementById("bulk-grade-table");
    if (!area || !currentExam) return;
    const questions = currentExam.questions || [];
    const students = currentExam.students || [];
    let html = `<table class="bulk-grade-table"><thead><tr>
      <th>تحديد</th><th>اسم الطالبة</th>
      ${questions.map(q => `<th>السؤال ${q.number}<br><small>من ${q.maxMark}</small></th>`).join("")}
      <th>المجموع</th><th>النسبة</th></tr></thead><tbody>`;
    students.forEach((student, si) => {
        const qResults = student.questions || [];
        const total = qResults.reduce((sum, q) => sum + (Number(q.mark) || 0), 0);
        const maxTotal = questions.reduce((sum, q) => sum + Number(q.maxMark), 0);
        html += `<tr><td><input class="bulk-student-select" type="checkbox" data-student-select="${si}" aria-label="تحديد ${emyEscape(student.name)}"></td>
          <td class="bulk-student-name">${emyEscape(student.name)}</td>`;
        questions.forEach((q, qi) => {
            const mark = qResults[qi]?.mark ?? "";
            html += `<td class="bulk-mark-reason-cell">
              <input type="number" min="0" max="${q.maxMark}" step="0.5"
                value="${mark === null ? "" : emyEscape(mark)}" data-bulk-student="${si}" data-bulk-question="${qi}"
                oninput="updateBulkRowSummary(${si})" aria-label="علامة ${emyEscape(student.name)} في السؤال ${q.number}">
              <small class="bulk-cell-error" id="bulk-error-${si}-${qi}" aria-live="polite"></small>
              <button type="button" class="bulk-reason-open" onclick="editBulkReasons(${si},${qi})">الأسباب</button>
              <span id="bulk-reason-summary-${si}-${qi}">${emyReasonSummaryHTML(student, qi)}</span>
            </td>`;
        });
        html += `<td id="bulk-total-${si}">${total.toFixed(2)}</td><td id="bulk-percent-${si}">${maxTotal ? (total / maxTotal * 100).toFixed(1) : "0.0"}%</td></tr>`;
    });
    html += "</tbody></table>";
    area.innerHTML = html;
    updateBulkSummary();
};

editBulkReasons = function (studentIndex, questionIndex) {
    const student = currentExam.students[studentIndex];
    const result = student.questions[questionIndex];
    bulkReasonTarget = { studentIndex, questionIndex };
    const selected = result.reasons || [];
    const panel = document.getElementById("bulk-reason-editor");
    panel.innerHTML = `<div class="bulk-reason-panel">
      <h3>أسباب الإخفاق — ${emyEscape(student.name)} — السؤال ${questionIndex + 1}</h3>
      <p>حددي الأسباب التي تنطبق على هذه الطالبة فقط. هذا التعديل مستقل عن التطبيق الجماعي.</p>
      <div class="english-reason-grid">
        ${EMY_ENGLISH_FAILURE_REASONS.map(reason => `<label><input type="checkbox" class="bulk-reason-check" value="${emyEscape(reason)}" ${selected.includes(reason) ? "checked" : ""}>${emyEscape(reason)}</label>`).join("")}
        <label><input type="checkbox" id="bulk-other-toggle" ${result.otherReason ? "checked" : ""}>أسباب أخرى</label>
      </div>
      <textarea id="bulk-other-text" rows="2" placeholder="اكتبي سببًا خاصًا بهذه الطالبة...">${emyEscape(result.otherReason || "")}</textarea>
      <div class="bulk-row-actions">
        <button type="button" onclick="saveBulkReasons()">حفظ أسباب هذه الطالبة</button>
        <button type="button" class="secondary-button" onclick="document.getElementById('bulk-reason-editor').innerHTML=''">إغلاق</button>
      </div>
    </div>`;
    document.getElementById("bulk-other-text").style.display = result.otherReason ? "block" : "none";
    document.getElementById("bulk-other-toggle").addEventListener("change", event => {
        document.getElementById("bulk-other-text").style.display = event.target.checked ? "block" : "none";
    });
};

saveBulkReasons = function () {
    if (!bulkReasonTarget) return;
    const { studentIndex, questionIndex } = bulkReasonTarget;
    const result = currentExam.students[studentIndex].questions[questionIndex];
    result.reasons = Array.from(document.querySelectorAll(".bulk-reason-check:checked")).map(x => x.value);
    result.otherReason = document.getElementById("bulk-other-toggle").checked
        ? document.getElementById("bulk-other-text").value.trim() : "";
    bulkReasonTarget = null;
    const summary = document.getElementById(`bulk-reason-summary-${studentIndex}-${questionIndex}`);
    if (summary) summary.innerHTML = emyReasonSummaryHTML(currentExam.students[studentIndex], questionIndex);
    document.getElementById("bulk-reason-editor").innerHTML =
        `<p class="reason-saved-note">تم حفظ الأسباب الفردية في النموذج. اضغطي «حفظ جميع العلامات» لتثبيتها.</p>`;
};

applyBulkReason = function () {
    const questionIndex = Number(document.getElementById("bulk-apply-question").value);
    const reason = document.getElementById("bulk-apply-reason").value;
    const selected = Array.from(document.querySelectorAll("[data-student-select]:checked"))
        .map(input => Number(input.dataset.studentSelect));
    const customText = document.getElementById("bulk-shared-other-text")?.value.trim() || "";
    if (!reason) { alert("اختاري سببًا أولًا."); return; }
    if (!selected.length) { alert("حددي الطالبات المطلوب تطبيق السبب عليهن."); return; }
    if (reason === "أسباب أخرى" && !customText) {
        alert("اكتبي السبب الآخر قبل تطبيقه.");
        document.getElementById("bulk-shared-other-text").focus();
        return;
    }
    selected.forEach(si => {
        const result = currentExam.students[si].questions[questionIndex];
        if (reason === "أسباب أخرى") {
            result.otherReason = customText;
            result.reasons = [...new Set([...(result.reasons || []), "أسباب أخرى"])];
        } else {
            result.reasons = [...new Set([...(result.reasons || []), reason])];
        }
        const summary = document.getElementById(`bulk-reason-summary-${si}-${questionIndex}`);
        if (summary) summary.innerHTML = emyReasonSummaryHTML(currentExam.students[si], questionIndex);
    });
    document.getElementById("bulk-apply-reason").value = "";
    document.getElementById("bulk-shared-other-text").value = "";
    document.getElementById("bulk-shared-other-wrap").style.display = "none";
    alert(`تم تطبيق السبب على ${selected.length} طالبة في السؤال المحدد. لم تتغير أسباب الطالبات غير المحددات.`);
};

// Add per-student failure-reason frequency to report data.
const __emyV3GetExamReportData = getExamReportData;
getExamReportData = function (exam) {
    const data = __emyV3GetExamReportData(exam);
    data.students = data.students.map(student => ({
        ...student,
        recurringReasons: getStudentReasonFrequency(student)
    }));
    return data;
};

// Keyboard support: Enter/arrow keys move through marks; Tab keeps native browser behavior.
if (!window.__emyKeyboardNavigationInstalled) {
    window.__emyKeyboardNavigationInstalled = true;
    document.addEventListener("keydown", event => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement) || target.type !== "number") return;
        const isIndividual = target.classList.contains("student-question-mark");
        const isBulk = target.hasAttribute("data-bulk-student");
        if (!isIndividual && !isBulk) return;
        if (!["Enter", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();

        if (isIndividual) {
            const marks = Array.from(document.querySelectorAll(".student-question-mark"));
            const index = marks.indexOf(target);
            const delta = (event.key === "ArrowUp" || (event.key === "Enter" && event.shiftKey)) ? -1 : 1;
            const next = marks[index + delta];
            if (next) next.focus();
            else if (event.key === "Enter" && !event.shiftKey) {
                document.querySelector('#student-entry-area button[onclick="saveStudent()"]')?.focus();
            } else if (!next && (event.key === "ArrowUp" || (event.key === "Enter" && event.shiftKey))) {
                document.getElementById("student-name")?.focus();
            }
            return;
        }

        const si = Number(target.dataset.bulkStudent);
        const qi = Number(target.dataset.bulkQuestion);
        const studentCount = currentExam?.students?.length || 0;
        const questionCount = currentExam?.questions?.length || 0;
        let nextSi = si, nextQi = qi;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            nextQi += event.key === "ArrowLeft" ? 1 : -1; // RTL table: left is next question
        } else {
            const delta = (event.key === "ArrowUp" || (event.key === "Enter" && event.shiftKey)) ? -1 : 1;
            nextSi += delta;
            if (nextSi >= studentCount) { nextSi = 0; nextQi += 1; }
            if (nextSi < 0) { nextSi = studentCount - 1; nextQi -= 1; }
        }
        if (nextQi >= 0 && nextQi < questionCount && nextSi >= 0 && nextSi < studentCount) {
            document.querySelector(`[data-bulk-student="${nextSi}"][data-bulk-question="${nextQi}"]`)?.focus();
        }
    });
}

if (!window.__emyFormEnterNavigationInstalled) {
    window.__emyFormEnterNavigationInstalled = true;
    document.addEventListener("keydown", event => {
        if (event.key !== "Enter" || event.shiftKey || event.target instanceof HTMLTextAreaElement) return;
        const el = event.target;
        if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;
        if (el.type === "checkbox" || el.type === "radio" || el.type === "file" || el.type === "button") return;
        if (el.classList.contains("student-question-mark") || el.hasAttribute("data-bulk-student")) return;
        const scope = el.closest(".emy-page") || document;
        const focusables = Array.from(scope.querySelectorAll("input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[tabindex]:not([tabindex='-1'])"))
            .filter(node => node.offsetParent !== null && !node.closest("[style*='display: none']"));
        const index = focusables.indexOf(el);
        if (index >= 0 && focusables[index + 1]) {
            event.preventDefault();
            focusables[index + 1].focus();
        }
    });
}


// Add recurring individual causes to the separate exam-results table, print view and Excel export.
const __emyV3RenderExamResultsTable = renderExamResultsTable;
renderExamResultsTable = function () {
    __emyV3RenderExamResultsTable();
    const exam = getSelectedExamForTable();
    const area = document.getElementById("exam-table-output");
    if (!exam || !area) return;
    const table = area.querySelector("table");
    if (!table) return;
    const header = table.querySelector("thead tr");
    if (header && !header.querySelector(".student-reasons-header")) {
        const th = document.createElement("th");
        th.className = "student-reasons-header";
        th.textContent = "أسباب الإخفاق المتكررة";
        header.appendChild(th);
    }
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const students = getExamTableData(exam).students;
    rows.forEach((row, index) => {
        if (row.cells.length < 4 || !students[index]) return;
        const td = document.createElement("td");
        const reasons = getStudentReasonFrequency(students[index]);
        td.textContent = reasons.slice(0, 3).map(item => `${item.reason} (${item.count})`).join("، ") || "لا توجد أسباب مسجلة";
        row.appendChild(td);
    });
    const empty = table.querySelector("tbody tr td[colspan]");
    if (empty) empty.colSpan = 5;
};

const __emyV3PrintExamResultsTable = printExamResultsTable;
printExamResultsTable = function () {
    const exam = getSelectedExamForTable();
    if (!exam) return __emyV3PrintExamResultsTable();
    const data = getExamTableData(exam);
    const summary = `<p>الصف والشعبة: ${escapeTableHtml(exam.className)} | عدد الطالبات: ${data.students.length} | أعلى علامة: ${data.students.length ? data.students[0].totalMark : 0} / ${data.maxTotal} | المعدل: ${data.average.toFixed(2)}</p>`;
    const rows = data.students.map((student, index) => {
        const reasons = getStudentReasonFrequency(student).slice(0, 3)
            .map(item => `${escapeTableHtml(item.reason)} (${item.count})`).join("، ") || "لا توجد أسباب مسجلة";
        return `<tr><td>${index + 1}</td><td>${escapeTableHtml(student.name)}</td><td>${student.totalMark}</td><td>${student.percentage.toFixed(2)}%</td><td>${reasons}</td></tr>`;
    }).join("");
    const table = `<table><thead><tr><th>الترتيب</th><th>اسم الطالبة</th><th>العلامة</th><th>النسبة</th><th>أسباب الإخفاق المتكررة</th></tr></thead><tbody>${rows || '<tr><td colspan="5">لا توجد طالبات</td></tr>'}</tbody></table>`;
    printHtmlTable(`نتائج ${exam.name}`, summary + table);
};

const __emyV3ExportExamResultsExcel = exportExamResultsExcel;
exportExamResultsExcel = function () {
    const exam = getSelectedExamForTable();
    if (!exam) return __emyV3ExportExamResultsExcel();
    if (typeof XLSX === "undefined") return __emyV3ExportExamResultsExcel();
    const data = getExamTableData(exam);
    const rows = [
        ["الترتيب", "اسم الطالبة", "العلامة", "النسبة المئوية", "أسباب الإخفاق المتكررة"],
        ...data.students.map((student, index) => [
            index + 1, student.name, student.totalMark, Number(student.percentage.toFixed(2)),
            getStudentReasonFrequency(student).slice(0, 3).map(item => `${item.reason} (${item.count})`).join(" | ") || "لا توجد أسباب مسجلة"
        ])
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ["اسم الامتحان", exam.name], ["الصف والشعبة", exam.className],
        ["أعلى علامة", data.students.length ? data.students[0].totalMark : 0],
        ["المعدل", Number(data.average.toFixed(2))], [], ...rows
    ]), "نتائج الطالبات");
    XLSX.writeFile(wb, `نتائج_${String(exam.name).replace(/[\\/:*?"<>|]/g, "_")}.xlsx`);
};


// =========================================================
// EMY V5: keyboard-first grading, clear per-question reason column,
// compact saved-exam cards, and reliable individual reason editing.
// =========================================================

// Put keyboard navigation in capture phase so it takes precedence over older handlers.
if (!window.__emyV5KeyboardInstalled) {
  window.__emyV5KeyboardInstalled = true;
  document.addEventListener("keydown", event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== "number") return;
    const individual = input.classList.contains("student-question-mark");
    const bulk = input.hasAttribute("data-bulk-student");
    if (!individual && !bulk) return;
    const keys = ["Enter", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    if (individual) {
      const fields = Array.from(document.querySelectorAll(".student-question-mark"));
      const index = fields.indexOf(input);
      let nextIndex = index;
      if (event.key === "Enter") nextIndex += event.shiftKey ? -1 : 1;
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex--;
      else if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex++;
      if (fields[nextIndex]) fields[nextIndex].focus();
      else if (nextIndex >= fields.length) {
        document.querySelector('#student-entry-area button[onclick="saveStudent()"]')?.focus();
      } else if (nextIndex < 0) {
        document.getElementById("student-name")?.focus();
      }
      return;
    }

    const si = Number(input.dataset.bulkStudent);
    const qi = Number(input.dataset.bulkQuestion);
    const studentCount = currentExam?.students?.length || 0;
    const questionCount = currentExam?.questions?.length || 0;
    let nextSi = si, nextQi = qi;
    if (event.key === "Enter") {
      // Enter moves across questions in the same student row; Shift+Enter reverses.
      nextQi += event.shiftKey ? -1 : 1;
      if (nextQi >= questionCount) { nextQi = 0; nextSi++; }
      if (nextQi < 0) { nextQi = questionCount - 1; nextSi--; }
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      nextSi += event.key === "ArrowUp" ? -1 : 1;
    } else {
      // In the RTL table, Left advances to the next question.
      nextQi += event.key === "ArrowLeft" ? 1 : -1;
    }
    if (nextSi >= 0 && nextSi < studentCount && nextQi >= 0 && nextQi < questionCount) {
      document.querySelector(`[data-bulk-student="${nextSi}"][data-bulk-question="${nextQi}"]`)?.focus();
    } else if (event.key === "Enter" && !event.shiftKey && (nextSi >= studentCount || nextQi >= questionCount)) {
      document.querySelector('#student-entry-area button[onclick="saveBulkGrading()"]')?.focus();
    }
  }, true);
}

// A dedicated reasons column: click the question number for one student only.
renderBulkGradeTable = function () {
  const area = document.getElementById("bulk-grade-table");
  if (!area || !currentExam) return;
  const questions = currentExam.questions || [];
  const students = currentExam.students || [];
  let html = `<table class="bulk-grade-table"><thead><tr>
    <th>تحديد</th><th>اسم الطالبة</th>
    ${questions.map(q => `<th>السؤال ${q.number}<br><small>من ${q.maxMark}</small></th>`).join("")}
    <th>المجموع</th><th>نسبة التحصيل</th><th class="bulk-reasons-column">أسباب الإخفاق — اختاري رقم السؤال</th>
    </tr></thead><tbody>`;
  students.forEach((student, si) => {
    const qResults = student.questions || [];
    const total = qResults.reduce((sum, q) => sum + (Number(q.mark) || 0), 0);
    const maxTotal = questions.reduce((sum, q) => sum + (Number(q.maxMark) || 0), 0);
    html += `<tr><td><input class="bulk-student-select" type="checkbox" data-student-select="${si}" aria-label="تحديد ${emyEscape(student.name)}"></td>
      <td class="bulk-student-name">${emyEscape(student.name)}</td>`;
    questions.forEach((q, qi) => {
      const mark = qResults[qi]?.mark ?? "";
      html += `<td class="bulk-mark-cell">
        <input type="number" min="0" max="${q.maxMark}" step="0.5"
          value="${mark === null ? "" : emyEscape(mark)}" data-bulk-student="${si}" data-bulk-question="${qi}"
          oninput="updateBulkRowSummary(${si})" aria-label="علامة ${emyEscape(student.name)} في السؤال ${q.number}">
        <small class="bulk-cell-error" id="bulk-error-${si}-${qi}" aria-live="polite"></small>
      </td>`;
    });
    const reasonButtons = questions.map((q, qi) => {
      const result = qResults[qi] || {};
      const count = (result.reasons || []).filter(x => x && x !== "أسباب أخرى").length + (String(result.otherReason || "").trim() ? 1 : 0);
      return `<button type="button" class="bulk-question-reason ${count ? "has-reason" : ""}"
        data-reason-student="${si}" data-reason-question="${qi}"
        onclick="editBulkReasons(${si},${qi})" aria-label="تعديل سبب الطالبة ${emyEscape(student.name)} للسؤال ${q.number}">
        س${q.number}${count ? `<small>${count} سبب</small>` : ""}</button>`;
    }).join("");
    html += `<td id="bulk-total-${si}">${total.toFixed(2)}</td>
      <td id="bulk-percent-${si}">${maxTotal ? (total / maxTotal * 100).toFixed(1) : "0.0"}%</td>
      <td class="bulk-reasons-column"><div class="bulk-question-reason-list">${reasonButtons}</div></td></tr>`;
  });
  html += "</tbody></table>";
  area.innerHTML = html;
  updateBulkSummary();
};

// Ensure the individual reason editor always opens the requested question's panel.
const __emyV5EditBulkReasons = editBulkReasons;
editBulkReasons = function (studentIndex, questionIndex) {
  __emyV5EditBulkReasons(studentIndex, questionIndex);
  const panel = document.getElementById("bulk-reason-editor");
  if (panel) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

// Refresh the question-number badges after individual reason edits.
const __emyV5SaveBulkReasons = saveBulkReasons;
saveBulkReasons = function () {
  const target = bulkReasonTarget ? { ...bulkReasonTarget } : null;
  __emyV5SaveBulkReasons();
  if (target) {
    const button = document.querySelector(`.bulk-question-reason[data-reason-student="${target.studentIndex}"][data-reason-question="${target.questionIndex}"]`);
    if (button) {
      const result = currentExam.students[target.studentIndex].questions[target.questionIndex];
      const count = (result.reasons || []).filter(x => x && x !== "أسباب أخرى").length + (String(result.otherReason || "").trim() ? 1 : 0);
      button.classList.toggle("has-reason", count > 0);
      button.innerHTML = `س${currentExam.questions[target.questionIndex].number}${count ? `<small>${count} سبب</small>` : ""}`;
    }
  }
};

// Keep question badges updated after applying a shared reason to selected students.
const __emyV5ApplyBulkReason = applyBulkReason;
applyBulkReason = function () {
  const questionIndex = Number(document.getElementById("bulk-apply-question")?.value);
  const selected = Array.from(document.querySelectorAll("[data-student-select]:checked"))
    .map(input => Number(input.dataset.studentSelect));
  __emyV5ApplyBulkReason();
  selected.forEach(si => {
    const result = currentExam?.students?.[si]?.questions?.[questionIndex];
    const button = document.querySelector(`.bulk-question-reason[data-reason-student="${si}"][data-reason-question="${questionIndex}"]`);
    if (!result || !button) return;
    const count = (result.reasons || []).filter(x => x && x !== "أسباب أخرى").length + (String(result.otherReason || "").trim() ? 1 : 0);
    button.classList.toggle("has-reason", count > 0);
    button.innerHTML = `س${currentExam.questions[questionIndex].number}${count ? `<small>${count} سبب</small>` : ""}`;
  });
};

// Saved exams become a responsive grid instead of a long single column.
const __emyV5RenderSavedExams = renderSavedExams;
renderSavedExams = function () {
  __emyV5RenderSavedExams();
  const area = document.getElementById("saved-exams-list");
  if (!area) return;
  area.classList.add("saved-exams-grid");
  area.querySelectorAll(":scope > .question-item").forEach(card => card.classList.add("saved-exam-card"));
};



// =========================================================
// EMY V6: safe partial completion, resumable drafts, and accurate reporting.
// =========================================================

function emyIsStudentComplete(student, questions = currentExam?.questions || []) {
  if (!student || !Array.isArray(student.questions) || !questions.length) return false;
  return questions.every((q, index) => {
    const item = student.questions[index];
    if (!item || item.mark === "" || item.mark === null || item.mark === undefined) return false;
    const mark = Number(item.mark);
    return Number.isFinite(mark) && mark >= 0 && mark <= Number(q.maxMark);
  });
}

function emyCaptureIndividualDraft() {
  if (!currentExam || currentExam.gradingMode === "bulk") return null;
  const nameInput = document.getElementById("student-name");
  const markInputs = Array.from(document.querySelectorAll(".student-question-mark"));
  if (!nameInput || !markInputs.length) return null;
  const questions = markInputs.map(input => {
    const box = input.closest(".question-item");
    return {
      mark: input.value,
      reasons: Array.from(box?.querySelectorAll(".failure-reason:checked") || []).map(x => x.value),
      otherReason: box?.querySelector(".other-reason-text")?.value || ""
    };
  });
  const hasContent = nameInput.value.trim() || questions.some(q =>
    q.mark !== "" || q.reasons.length || q.otherReason.trim()
  ) || editingStudentIndex !== null;
  if (!hasContent) return null;
  return {
    name: nameInput.value,
    questions,
    editingStudentIndex: editingStudentIndex
  };
}

function emyRestoreIndividualDraft() {
  const draft = currentExam?.pendingStudentDraft;
  if (!draft) return;
  const nameInput = document.getElementById("student-name");
  if (!nameInput) return;
  nameInput.value = draft.name || "";
  editingStudentIndex = Number.isInteger(draft.editingStudentIndex) ? draft.editingStudentIndex : null;
  const title = document.getElementById("student-form-title");
  if (title && editingStudentIndex !== null) {
    title.textContent = `استكمال تعديل بيانات الطالبة: ${draft.name || currentExam.students[editingStudentIndex]?.name || "بدون اسم"}`;
  } else if (title) {
    title.textContent = `استكمال إدخال الطالبة رقم ${currentExam.students.length + 1}`;
  }
  const inputs = document.querySelectorAll(".student-question-mark");
  inputs.forEach((input, index) => {
    const saved = draft.questions?.[index];
    if (!saved) return;
    input.value = saved.mark ?? "";
    const box = input.closest(".question-item");
    box?.querySelectorAll(".failure-reason").forEach(check => {
      check.checked = (saved.reasons || []).includes(check.value);
    });
    const toggle = box?.querySelector(".other-reason-toggle");
    const otherBox = box?.querySelector(".other-reason-box");
    const otherText = box?.querySelector(".other-reason-text");
    if (otherText) otherText.value = saved.otherReason || "";
    if (otherBox) otherBox.style.display = toggle?.checked ? "block" : "none";
  });
  if (typeof calculateStudentResults === "function") calculateStudentResults();
}

// Preserve a partially entered individual student instead of blocking completion.
finishGrading = function () {
  if (!currentExam) return;
  const draft = emyCaptureIndividualDraft();
  if (draft) {
    const enteredMarks = draft.questions.filter(q => q.mark !== "").length;
    const message = `سيتم حفظ ما أدخلتِه كمسودة، دون اعتبار الخانات الفارغة أصفارًا.\nالعلامات المدخلة: ${enteredMarks} من ${currentExam.questions.length}.\nيمكنك استكمالها لاحقًا. هل تريدين المتابعة؟`;
    if (!confirm(message)) return;
    currentExam.pendingStudentDraft = draft;
    currentExam.status = "غير مكتمل";
  } else {
    delete currentExam.pendingStudentDraft;
    currentExam.status = currentExam.students.length ? "مكتمل" : "غير مكتمل";
  }
  saveCurrentExam();
  renderSavedExams();
  const area = document.getElementById("student-entry-area");
  const pending = Boolean(currentExam.pendingStudentDraft);
  area.innerHTML = `
    <div class="grading-finish-card ${pending ? "is-pending" : "is-complete"}">
      <h2>${pending ? "حُفظ التقدم بنجاح" : (currentExam.students.length ? "اكتمل التصحيح" : "حُفظ الامتحان دون نتائج بعد")}</h2>
      <p>الامتحان: ${reportEscape(currentExam.name)}</p>
      <p>الطالبات المحفوظات: ${currentExam.students.length}</p>
      <p>الحالة: <strong>${pending || !currentExam.students.length ? "غير مكتمل" : "مكتمل"}</strong></p>
      ${pending ? "<p>تم الاحتفاظ بالاسم والعلامات والأسباب التي أدخلتِها، ويمكنك متابعة العمل لاحقًا.</p>" : "<p>يمكنك فتح الامتحان من قائمة الامتحانات المحفوظة لتعديل النتائج عند الحاجة.</p>"}
      <button type="button" onclick="resumeCurrentExam()">${pending ? "استكمال من حيث توقفت" : "فتح الامتحان"}</button>
      <button type="button" class="secondary-button" onclick="showSavedExamsPage()">الامتحانات المحفوظة</button>
    </div>`;
};

resumeCurrentExam = function () {
  if (!currentExam) return;
  currentExam.status = "قيد التصحيح";
  saveCurrentExam();
  showStudentForm();
  loadStudentQuestions();
  emyRestoreIndividualDraft();
  document.getElementById("student-entry-area")?.scrollIntoView({ behavior: "smooth" });
};

// Clear the pending draft only after a successful individual save.
const __emyV6OriginalSaveStudent = saveStudent;
saveStudent = function () {
  const beforeCount = currentExam?.students?.length || 0;
  const wasEditing = editingStudentIndex !== null;
  __emyV6OriginalSaveStudent();
  const nameNow = document.getElementById("student-name")?.value;
  const saved = currentExam && nameNow === "" &&
    (currentExam.students.length > beforeCount || wasEditing);
  if (saved) {
    delete currentExam.pendingStudentDraft;
    saveCurrentExam();
    renderSavedExams();
  }
};

// Partial bulk save: empty cells remain null and never become zero.
const __emyV6OriginalSaveBulkGrading = saveBulkGrading;
saveBulkGrading = function (allowIncomplete = false) {
  if (!currentExam) return false;
  const students = currentExam.students || [];
  const maxTotal = currentExam.questions.reduce((sum, q) => sum + Number(q.maxMark), 0);
  for (let si = 0; si < students.length; si++) {
    let total = 0;
    let completedQuestions = 0;
    const questionResults = [];
    for (let qi = 0; qi < currentExam.questions.length; qi++) {
      const q = currentExam.questions[qi];
      const input = document.querySelector(`[data-bulk-student="${si}"][data-bulk-question="${qi}"]`);
      if (!input) {
        if (!allowIncomplete) return false;
        const old = students[si].questions?.[qi] || {};
        questionResults.push({ questionNumber:q.number, maxMark:q.maxMark, skill:q.skill || "", mark:null,
          achievementPercentage:null, failurePercentage:null, reasons:old.reasons || [], otherReason:old.otherReason || "" });
        continue;
      }
      if (input.value === "") {
        if (!allowIncomplete) {
          alert(`أدخلي علامة ${students[si].name} في السؤال ${qi + 1}، أو استخدمي «إنهاء التصحيح» لحفظه كغير مكتمل.`);
          input.focus();
          return false;
        }
        const old = students[si].questions?.[qi] || {};
        questionResults.push({ questionNumber:q.number, maxMark:q.maxMark, skill:q.skill || "", mark:null,
          achievementPercentage:null, failurePercentage:null, reasons:old.reasons || [], otherReason:old.otherReason || "" });
        continue;
      }
      const mark = Number(input.value);
      if (!Number.isFinite(mark) || mark < 0 || mark > Number(q.maxMark)) {
        validateBulkCell(input);
        alert(`علامة ${students[si].name} في السؤال ${qi + 1} يجب أن تكون بين 0 و${q.maxMark}.`);
        input.focus();
        return false;
      }
      const old = students[si].questions?.[qi] || {};
      const achievement = q.maxMark ? mark / q.maxMark * 100 : 0;
      questionResults.push({ questionNumber:q.number, maxMark:q.maxMark, skill:q.skill || "", mark,
        achievementPercentage:achievement, failurePercentage:100-achievement,
        reasons:old.reasons || [], otherReason:old.otherReason || "" });
      total += mark;
      completedQuestions++;
    }
    const complete = completedQuestions === currentExam.questions.length;
    students[si] = {
      ...students[si],
      questions:questionResults,
      totalMark:total,
      maxTotal,
      completedQuestions,
      isComplete:complete,
      percentage:complete && maxTotal ? total / maxTotal * 100 : null,
      failurePercentage:complete && maxTotal ? 100 - total / maxTotal * 100 : null
    };
  }
  currentExam.status = "قيد التصحيح";
  saveCurrentExam();
  renderSavedExams();
  return true;
};

finishBulkGrading = function () {
  if (!currentExam || !saveBulkGrading(true)) return;
  const incomplete = currentExam.students.filter(student => !emyIsStudentComplete(student, currentExam.questions)).length;
  currentExam.status = incomplete ? "غير مكتمل" : "مكتمل";
  saveCurrentExam();
  renderSavedExams();
  const area = document.getElementById("student-entry-area");
  area.innerHTML = `
    <div class="grading-finish-card ${incomplete ? "is-pending" : "is-complete"}">
      <h2>${incomplete ? "حُفظ التصحيح الجزئي" : "اكتمل تصحيح الامتحان"}</h2>
      <p>عدد الطالبات: ${currentExam.students.length}</p>
      <p>طالبات اكتملت علاماتهن: ${currentExam.students.length - incomplete}</p>
      <p>طالبات بانتظار استكمال العلامات: ${incomplete}</p>
      <p>الحالة: <strong>${currentExam.status}</strong></p>
      <button type="button" onclick="resumeCurrentExam()">${incomplete ? "استكمال التصحيح" : "فتح الامتحان"}</button>
      <button type="button" class="secondary-button" onclick="showSavedExamsPage()">الامتحانات المحفوظة</button>
    </div>`;
};

// Resume the correct grading mode and restore a saved individual draft.
openSavedExam = function (examId) {
  const exam = exams.find(item => String(item.id) === String(examId));
  if (!exam) { alert("لم يتم العثور على الامتحان."); return; }
  currentExam = exam;
  currentStudentIndex = exam.students?.length || 0;
  openEMYPage("exam-page");
  if (exam.gradingMode === "bulk") {
    startBulkGrading();
  } else {
    showStudentForm();
    loadStudentQuestions();
    emyRestoreIndividualDraft();
  }
  openExamSubtab("grading");
};

// Accurate keyboard feedback: summaries only include fully graded rows.
updateBulkRowSummary = function (si) {
  if (!currentExam) return;
  let total = 0, max = 0, count = 0;
  currentExam.questions.forEach((q, qi) => {
    max += Number(q.maxMark) || 0;
    const input = document.querySelector(`[data-bulk-student="${si}"][data-bulk-question="${qi}"]`);
    if (input && input.value !== "" && Number.isFinite(Number(input.value))) {
      total += Number(input.value); count++;
    }
  });
  const totalCell = document.getElementById(`bulk-total-${si}`);
  const percentCell = document.getElementById(`bulk-percent-${si}`);
  if (totalCell) totalCell.textContent = total.toFixed(2);
  if (percentCell) percentCell.textContent = count === currentExam.questions.length && max ? `${(total / max * 100).toFixed(1)}%` : `غير مكتمل (${count}/${currentExam.questions.length})`;
  updateBulkSummary();
};

updateBulkSummary = function () {
  if (!currentExam) return;
  const students = currentExam.students || [];
  const completeTotals = [];
  let incomplete = 0;
  students.forEach((student, si) => {
    let total = 0, count = 0;
    currentExam.questions.forEach((q, qi) => {
      const input = document.querySelector(`[data-bulk-student="${si}"][data-bulk-question="${qi}"]`);
      if (input && input.value !== "" && Number.isFinite(Number(input.value)) && Number(input.value) >= 0 && Number(input.value) <= Number(q.maxMark)) {
        total += Number(input.value); count++;
      }
    });
    if (count === currentExam.questions.length) completeTotals.push(total);
    else incomplete++;
  });
  const maxTotal = currentExam.questions.reduce((sum, q) => sum + Number(q.maxMark), 0);
  const average = completeTotals.length ? completeTotals.reduce((a,b) => a+b,0) / completeTotals.length : null;
  const high = completeTotals.length ? Math.max(...completeTotals) : null;
  const area = document.getElementById("bulk-grade-summary");
  if (area) area.innerHTML = `<span>عدد الطالبات: ${students.length}</span><span>العلامة الكلية: ${maxTotal}</span><span>معدل المكتملات: ${average === null ? "—" : average.toFixed(2)}</span><span>أعلى علامة مكتملة: ${high === null ? "—" : high.toFixed(2)}</span><span class="bulk-pending-count">بانتظار الاستكمال: ${incomplete}</span>`;
};

const __emyV6RenderBulkGradeTable = renderBulkGradeTable;
renderBulkGradeTable = function () {
  __emyV6RenderBulkGradeTable();
  if (currentExam) currentExam.students.forEach((student, si) => updateBulkRowSummary(si));
};

// Use only complete student records for percentages, rankings, and exam reports.
const __emyV6AnalyzeExam = analyzeExam;
analyzeExam = function (examId) {
  const exam = exams.find(item => String(item.id) === String(examId));
  if (!exam) return __emyV6AnalyzeExam(examId);
  const allStudents = exam.students || [];
  const completeStudents = allStudents.filter(student => emyIsStudentComplete(student, exam.questions));
  const incompleteCount = allStudents.length - completeStudents.length;
  exam.students = completeStudents;
  try { __emyV6AnalyzeExam(examId); }
  finally { exam.students = allStudents; }
  const host = document.getElementById("analysis-results");
  if (host && incompleteCount) {
    host.insertAdjacentHTML("afterbegin", `<div class="analysis-partial-note"><strong>تنبيه حول اكتمال البيانات</strong><span>تم استبعاد ${incompleteCount} طالبة غير مكتملة العلامات من حساب النسب والمتوسطات والرسوم البيانية. أكملي تصحيحهن لتحديث التحليل.</span></div>`);
  }
};

const __emyV6GetExamReportData = getExamReportData;
getExamReportData = function (exam) {
  const allStudents = exam.students || [];
  exam.students = allStudents.filter(student => emyIsStudentComplete(student, exam.questions));
  try { return __emyV6GetExamReportData(exam); }
  finally { exam.students = allStudents; }
};

const __emyV6GetExamTableData = getExamTableData;
getExamTableData = function (exam) {
  const allStudents = exam.students || [];
  exam.students = allStudents.filter(student => emyIsStudentComplete(student, exam.questions));
  try { return __emyV6GetExamTableData(exam); }
  finally { exam.students = allStudents; }
};

// Make incomplete counts visible on saved-exam cards.
const __emyV6RenderSavedExams = renderSavedExams;
renderSavedExams = function () {
  __emyV6RenderSavedExams();
  const area = document.getElementById("saved-exams-list");
  if (!area || !currentExam && !exams.length) return;
  area.querySelectorAll(":scope > .question-item").forEach((card, index) => {
    const exam = exams[index];
    if (!exam) return;
    const incomplete = (exam.students || []).filter(student => !emyIsStudentComplete(student, exam.questions)).length;
    let note = card.querySelector(".saved-exam-progress");
    if (!note) { note = document.createElement("p"); note.className = "saved-exam-progress"; card.appendChild(note); }
    note.textContent = incomplete ? `بانتظار استكمال العلامات: ${incomplete} طالبة` : "لا توجد علامات ناقصة في السجلات الحالية";
  });
};

// Auto-save unfinished work locally as the teacher types or edits reasons.
(function installEMYDraftAutosave() {
  const area = document.getElementById("student-entry-area");
  if (!area || area.dataset.emyAutosaveInstalled) return;
  area.dataset.emyAutosaveInstalled = "true";
  const persist = event => {
    if (!currentExam) return;
    const target = event.target;
    if (currentExam.gradingMode === "bulk") {
      if (target?.hasAttribute?.("data-bulk-student")) {
        const si = Number(target.dataset.bulkStudent), qi = Number(target.dataset.bulkQuestion);
        const q = currentExam.questions[qi];
        const student = currentExam.students[si];
        if (student && q && (target.value === "" || (Number.isFinite(Number(target.value)) && Number(target.value) >= 0 && Number(target.value) <= Number(q.maxMark)))) {
          student.questions[qi].mark = target.value === "" ? null : Number(target.value);
          student.isComplete = emyIsStudentComplete(student, currentExam.questions);
          saveCurrentExam();
        }
      } else if (bulkReasonTarget && (target?.classList?.contains("bulk-reason-check") || target?.id === "bulk-other-text" || target?.id === "bulk-other-toggle")) {
        const { studentIndex, questionIndex } = bulkReasonTarget;
        const result = currentExam.students[studentIndex]?.questions?.[questionIndex];
        if (result) {
          result.reasons = Array.from(area.querySelectorAll(".bulk-reason-check:checked")).map(x => x.value);
          result.otherReason = area.querySelector("#bulk-other-toggle")?.checked ? (area.querySelector("#bulk-other-text")?.value || "").trim() : "";
          saveCurrentExam();
        }
      }
      return;
    }
    if (target?.id === "student-name" || target?.classList?.contains("student-question-mark") || target?.classList?.contains("failure-reason") || target?.classList?.contains("other-reason-text")) {
      const draft = emyCaptureIndividualDraft();
      if (draft) currentExam.pendingStudentDraft = draft;
      else delete currentExam.pendingStudentDraft;
      saveCurrentExam();
    }
  };
  area.addEventListener("input", persist);
  area.addEventListener("change", persist);
})();

// =========================================================
// EMY V8: immediate, visible red validation for marks above
// the maximum in both individual and bulk grading.
// This patch intentionally layers on top of V7 without
// replacing its features or data structures.
// =========================================================
(function installEMYImmediateMarkValidation() {
  if (window.__emyImmediateMarkValidationInstalled) return;
  window.__emyImmediateMarkValidationInstalled = true;

  function validateIndividual(input) {
    if (!currentExam || !input) return;
    const qi = Number(input.dataset.question);
    const question = currentExam.questions?.[qi];
    if (!question) return;
    const max = Number(question.maxMark);
    const value = input.value;
    let message = "";
    if (value !== "") {
      const mark = Number(value);
      if (!Number.isFinite(mark) || mark < 0) {
        message = `تنبيه: أدخلي علامة صحيحة من 0 إلى ${max}.`;
      } else if (mark > max) {
        message = `تنبيه: العلامة المدخلة أعلى من العلامة القصوى للسؤال ${question.number} (${max}). عدّليها قبل المتابعة.`;
      }
    }
    showQuestionMarkError(input, message);
    const error = input.closest(".question-item")?.querySelector(".question-error-message");
    if (error) error.classList.toggle("is-visible-error", Boolean(message));
  }

  function validateBulk(input) {
    if (!currentExam || !input) return;
    const si = Number(input.dataset.bulkStudent);
    const qi = Number(input.dataset.bulkQuestion);
    const question = currentExam.questions?.[qi];
    const student = currentExam.students?.[si];
    if (!question) return;
    const max = Number(question.maxMark);
    const value = input.value;
    let message = "";
    if (value !== "") {
      const mark = Number(value);
      if (!Number.isFinite(mark) || mark < 0) message = "أدخلي علامة صحيحة.";
      else if (mark > max) message = `أعلى من الحد! أقصى علامة للسؤال ${question.number}: ${max}`;
    }
    const error = document.getElementById(`bulk-error-${si}-${qi}`);
    if (error) {
      error.textContent = message;
      error.classList.toggle("is-visible-error", Boolean(message));
      error.setAttribute("role", "alert");
    }
    input.classList.toggle("mark-invalid", Boolean(message));
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    if (typeof updateBulkRowSummary === "function") updateBulkRowSummary(si);
  }

  function handleMarkChange(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.classList.contains("student-question-mark")) {
      validateIndividual(input);
      if (typeof calculateStudentResults === "function") calculateStudentResults();
    } else if (input.hasAttribute("data-bulk-student")) {
      validateBulk(input);
    }
  }

  // Capture phase ensures validation still runs when a table is re-rendered
  // or another feature has its own input handler.
  document.addEventListener("input", handleMarkChange, true);
  document.addEventListener("change", handleMarkChange, true);
})();


// =========================================================
// EMY V8.1 — non-blocking notifications, consistent keyboard
// navigation, persistent incomplete-analysis filtering, and
// synchronized mark editing from reports/analysis.
// =========================================================
(function installEMYV81Improvements(){
  const $ = id => document.getElementById(id);

  // Compact notifications replace blocking alert popups. Confirm dialogs
  // remain native for destructive or consequential actions.
  function toast(message, kind='success'){
    let region=document.querySelector('.emy-toast-region');
    if(!region){
      region=document.createElement('div');
      region.className='emy-toast-region';
      region.setAttribute('aria-live','polite');
      region.setAttribute('aria-atomic','false');
      document.body.appendChild(region);
    }
    const item=document.createElement('div');
    item.className='emy-toast '+kind;
    item.setAttribute('role',kind==='error'?'alert':'status');
    item.textContent=String(message??'');
    region.appendChild(item);
    window.setTimeout(()=>item.remove(),3800);
    while(region.children.length>4) region.firstElementChild?.remove();
  }
  window.emyToast=toast;
  const nativeAlert=window.alert.bind(window);
  window.alert=function(message){
    const text=String(message??'');
    const isError=/يرجى|يجب|خطأ|غير صحيحة|أعلى|أقل|تنبيه|لم يتم|تعذّر|لا توجد|اختاري|أدخلي|الحد الأقصى|يحتاج اتصال/i.test(text);
    const isWarning=/غير مكتمل|ناقص|تأكدي|تأكدي من|تحققي/i.test(text);
    toast(text,isError?'error':isWarning?'warning':'success');
  };

  function setSaveStatus(text,mode='saved'){
    const el=$('emy-save-status'); if(!el)return;
    el.textContent=text;
    el.classList.remove('is-saving','is-saved','has-error');
    el.classList.add(mode==='saving'?'is-saving':mode==='error'?'has-error':'is-saved');
  }
  const baseSaveCurrentExam=window.saveCurrentExam;
  if(typeof baseSaveCurrentExam==='function'){
    window.saveCurrentExam=function(){
      setSaveStatus('جارٍ الحفظ…','saving');
      try{
        baseSaveCurrentExam();
        setSaveStatus('✓ تم الحفظ','saved');
        // Always refresh derived views from the current canonical exam record.
        if(currentExam){
          if(String(currentAnalysisExamId)===String(currentExam.id) && $('analysis-page')?.style.display!=='none'){
            analyzeExam(currentExam.id);
          }
          const tableSelect=$('exam-table-select');
          if(tableSelect && String(tableSelect.value)===String(currentExam.id) && $('tables-page')?.style.display!=='none'){
            renderExamResultsTable();
          }
        }
      }catch(error){
        setSaveStatus('تعذّر الحفظ','error');
        toast('تعذّر حفظ التغييرات. تحققي من مساحة التخزين ونزّلي نسخة احتياطية.','error');
        throw error;
      }
    };
  }

  // Fix the old tab-return path: it called the pre-filter analyzer directly,
  // bypassing the V6 completeness filter. Always call the latest analyzer.
  window.showAnalysis=function(){
    openEMYPage('analysis-page');
    const section=$('analysis-area'); if(section)section.style.display='block';
    renderAnalysisExams();
    if(currentAnalysisExamId && exams.some(x=>String(x.id)===String(currentAnalysisExamId))){
      analyzeExam(currentAnalysisExamId);
      openAnalysisSubtab('results');
    }else{
      openAnalysisSubtab('choose');
    }
  };

  // Edit a student's question-by-question marks from either results table
  // or analysis, reusing the existing grading editor and data model.
  window.emyEditStudentFromResults=function(examId,studentIndex){
    const exam=exams.find(x=>String(x.id)===String(examId));
    if(!exam || !exam.students?.[studentIndex]){toast('تعذّر العثور على سجل الطالبة.','error');return;}
    currentExam=exam;
    currentStudentIndex=studentIndex;
    openEMYPage('exam-page');
    showStudentForm();
    loadStudentQuestions();
    editStudent(studentIndex);
    openExamSubtab('grading');
    $('student-entry-area')?.scrollIntoView({behavior:'smooth',block:'start'});
    toast('عدّلي علامات الأسئلة ثم احفظي؛ سيتحدّث التحليل والجداول تلقائيًا.','warning');
  };

  // Add an editable student list to analysis. Only complete students are
  // shown in the analytical cohort; incomplete records remain in grading.
  const baseAnalyze=window.analyzeExam;
  if(typeof baseAnalyze==='function'){
    window.analyzeExam=function(examId){
      baseAnalyze(examId);
      const exam=exams.find(x=>String(x.id)===String(examId));
      const host=$('analysis-results');
      if(!exam || !host)return;
      const complete=(exam.students||[]).map((student,index)=>({student,index}))
        .filter(x=>emyIsStudentComplete(x.student,exam.questions));
      const rows=complete.map(({student,index},rank)=>
        `<tr><td>${rank+1}</td><td>${reportEscape(student.name||'بدون اسم')}</td><td>${Number(student.totalMark||0).toFixed(2)}</td><td>${(Number(student.percentage)||0).toFixed(1)}%</td><td><button type="button" class="exam-result-edit-button" onclick="emyEditStudentFromResults('${String(exam.id).replace(/'/g,'\\\'')}',${index})">تعديل العلامات</button></td></tr>`
      ).join('');
      const note=`<section class="analysis-panel analysis-span-2 analysis-student-edit-list"><div class="analysis-panel-title"><div><h3>نتائج الطالبات وإمكانية التعديل</h3><p>التعديل يفتح سجل الطالبة التفصيلي، وبعد الحفظ تتحدث النتائج تلقائيًا</p></div></div><div class="table-scroll"><table><thead><tr><th>م</th><th>اسم الطالبة</th><th>المجموع</th><th>النسبة</th><th>الإجراء</th></tr></thead><tbody>${rows||'<tr><td colspan="5">لا توجد سجلات مكتملة لعرضها في التحليل.</td></tr>'}</tbody></table></div></section>`;
      host.insertAdjacentHTML('beforeend',note);
    };
  }

  // Keep the results table synchronized and expose the same edit route.
  const baseRenderExamResultsTable=window.renderExamResultsTable;
  if(typeof baseRenderExamResultsTable==='function'){
    window.renderExamResultsTable=function(){
      baseRenderExamResultsTable();
      const exam=getSelectedExamForTable();
      const area=$('exam-table-output');
      if(!exam || !area)return;
      const table=area.querySelector('table'); if(!table)return;
      const header=table.tHead?.rows?.[0];
      if(header && !header.querySelector('[data-edit-heading]')){
        const th=document.createElement('th'); th.dataset.editHeading='1'; th.textContent='الإجراء'; header.appendChild(th);
      }
      const data=getExamTableData(exam);
      const used=new Set();
      Array.from(table.tBodies[0]?.rows||[]).forEach((row,rank)=>{
        const student=data.students[rank]; if(!student)return;
        const sourceIndex=exam.students.findIndex((source,i)=>!used.has(i) && String(source.name||'')===String(student.name||'') && Number(source.totalMark||0)===Number(student.totalMark||0) && emyIsStudentComplete(source,exam.questions));
        if(sourceIndex>=0)used.add(sourceIndex);
        const td=document.createElement('td');
        if(sourceIndex>=0){
          const button=document.createElement('button');button.type='button';button.className='exam-result-edit-button';button.textContent='تعديل';
          button.addEventListener('click',()=>emyEditStudentFromResults(exam.id,sourceIndex));td.appendChild(button);
        }else td.textContent='—';
        row.appendChild(td);
      });
    };
  }

  // Save-status feedback for all EMY local-storage writes, including table
  // and activity saves, while preserving the existing storage mechanism.
  try{
    const rawSet=Storage.prototype.setItem;
    if(!Storage.prototype.__emyV81Wrapped){
      Storage.prototype.setItem=function(key,value){
        const isEMY=String(key).startsWith('emy');
        if(isEMY)setSaveStatus('جارٍ الحفظ…','saving');
        try{const result=rawSet.call(this,key,value);if(isEMY)setSaveStatus('✓ تم الحفظ','saved');return result;}
        catch(error){if(isEMY)setSaveStatus('تعذّر الحفظ','error');throw error;}
      };
      Storage.prototype.__emyV81Wrapped=true;
    }
  }catch(error){}

  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')setSaveStatus('✓ جاهز للعمل','saved');
  });
})();
