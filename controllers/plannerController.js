const Planner = require('../models/planner');
const moment = require('moment');
moment.locale('ko'); // 로케일 설정

// 유효한 ENUM 값 설정
const validNotifications = ["안 함", "5분 전", "10분 전", "15분 전", "30분 전", "1시간 전", "2시간 전", "1일 전", "2일 전"];
const validRepeats = ["안 함", "월", "화", "수", "목", "금", "토", "일"];

// 일정 생성 컨트롤러
exports.createPlanner = async (req, res) => {
    try {
        const {
            start_day,
            end_day,
            title,
            start_time,
            end_time,
            memo,
            notification,
            repeat,
            check_box,
            url
        } = req.body;

        const parsedStartDay = moment(start_day, 'YYYY.MM.DD', true);
        const parsedEndDay = end_day ? moment(end_day, 'YYYY.MM.DD', true) : null;

        if (!parsedStartDay.isValid() || (end_day && !parsedEndDay.isValid())) {
            return res.status(400).json({ error: '올바른 날짜 형식이 아닙니다. YYYY.MM.DD 형식으로 입력하세요.' });
        }

        // ENUM 값 유효성 검사
        const notificationValue = validNotifications.includes(notification) ? notification : "안 함";
        const repeatValue = validRepeats.includes(repeat) ? repeat : "안 함";

        const newPlanner = await Planner.create({
            start_day: parsedStartDay.format('YYYY-MM-DD'),
            end_day: parsedEndDay ? parsedEndDay.format('YYYY-MM-DD') : null,
            title,
            start_time,
            end_time,
            memo,
            notification: notificationValue,
            repeat: repeatValue,
            check_box,
            url,
            userEmail: req.user.email  // 토큰에서 인증된 사용자 이메일 가져오기
        });

        res.status(201).json({
            message: "일정이 생성되었습니다.",
            planner: newPlanner
        });
    } catch (error) {
        console.error("일정 생성 중 오류 발생:", error.message, error.stack);
        res.status(500).json({ message: "일정 생성 중 오류가 발생했습니다.", error: error.message });
    }
};

// 특정 날짜의 일정 조회 컨트롤러
exports.getPlannersByDate = async (req, res) => {
    const { date } = req.query; // 날짜는 쿼리 파라미터로 받음
    const userEmail = req.user.email;

    try {
        const parsedDate = moment(date, 'YYYY.MM.DD', true);
        if (!parsedDate.isValid()) {
            return res.status(400).json({ error: '올바른 날짜 형식이 아닙니다. YYYY.MM.DD 형식으로 입력하세요.' });
        }

        const planners = await Planner.findAll({
            where: {
                start_day: parsedDate.format('YYYY-MM-DD'),
                userEmail
            },
            order: [['start_time', 'ASC']]
        });

        res.status(200).json(planners.length > 0 ? planners : { message: '해당 날짜에 일정이 없습니다.' });
    } catch (error) {
        console.error("일정 조회 중 오류 발생:", error.message, error.stack);
        res.status(500).json({ message: "일정 조회 중 오류가 발생했습니다.", error: error.message });
    }
};

// 특정 ID의 일정을 조회하는 컨트롤러
exports.getPlannerById = async (req, res) => {
    const { id } = req.params;

    try {
        const planner = await Planner.findOne({ where: { id, userEmail: req.user.email } });
        if (planner) {
            res.status(200).json(planner);
        } else {
            res.status(404).json({ message: "일정을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "일정 조회 중 오류가 발생했습니다." });
    }
};

// 일정 수정 컨트롤러
exports.updatePlannerById = async (req, res) => {
    const { id } = req.params;
    const {
        start_day,
        end_day,
        title,
        start_time,
        end_time,
        memo,
        notification,
        repeat,
        check_box,
        url
    } = req.body;

    try {
        const planner = await Planner.findOne({ where: { id, userEmail: req.user.email } });
        if (!planner) {
            return res.status(404).json({ message: "일정을 찾을 수 없습니다." });
        }

        // 날짜 형식 검사
        const parsedStartDay = start_day ? moment(start_day, 'YYYY.MM.DD', true) : null;
        const parsedEndDay = end_day ? moment(end_day, 'YYYY.MM.DD', true) : null;
        if (parsedStartDay && !parsedStartDay.isValid()) {
            return res.status(400).json({ error: '올바른 시작 날짜 형식이 아닙니다. YYYY.MM.DD 형식으로 입력하세요.' });
        }
        if (parsedEndDay && !parsedEndDay.isValid()) {
            return res.status(400).json({ error: '올바른 종료 날짜 형식이 아닙니다. YYYY.MM.DD 형식으로 입력하세요.' });
        }

        // ENUM 값 유효성 검사
        const notificationValue = validNotifications.includes(notification) ? notification : "안 함";
        const repeatValue = validRepeats.includes(repeat) ? repeat : "안 함";

        await planner.update({
            start_day: parsedStartDay ? parsedStartDay.format('YYYY-MM-DD') : planner.start_day,
            end_day: parsedEndDay ? parsedEndDay.format('YYYY-MM-DD') : planner.end_day,
            title,
            start_time,
            end_time,
            memo,
            notification: notificationValue,
            repeat: repeatValue,
            check_box,
            url,
            userEmail: req.user.email
        });

        res.status(200).json({ message: "일정이 수정되었습니다." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "일정 수정 중 오류가 발생했습니다." });
    }
};

// 일정 삭제 컨트롤러
exports.deletePlannerById = async (req, res) => {
    const { id } = req.params;

    try {
        const planner = await Planner.findOne({ where: { id, userEmail: req.user.email } });
        if (!planner) {
            return res.status(404).json({ message: "일정을 찾을 수 없습니다." });
        }

        await planner.destroy();
        res.status(200).json({ message: "일정이 삭제되었습니다." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "일정 삭제 중 오류가 발생했습니다." });
    }
};
