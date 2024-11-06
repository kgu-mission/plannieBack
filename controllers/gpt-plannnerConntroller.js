const Planner = require('../models/Planner');
const moment = require('moment');
const { Op } = require("sequelize");
moment.locale('ko'); // 로케일 설정

const validNotifications = ["안 함", "5분 전", "10분 전", "15분 전", "30분 전", "1시간 전", "2시간 전", "1일 전", "2일 전"];
const validRepeats = ["안 함", "월", "화", "수", "목", "금", "토", "일"];

exports.createPlanner = async (data) => {
    try {
        const { start_day, end_day, title, start_time, end_time, userEmail } = data;

        if (!title) {
            throw new Error("일정 제목이 필요합니다.");
        }

        const parsedStartDay = moment(start_day, 'YYYY-MM-DD', true);
        const parsedEndDay = end_day ? moment(end_day, 'YYYY-MM-DD', true) : null;

        if (!parsedStartDay.isValid() || (end_day && !parsedEndDay.isValid())) {
            return { error: '올바른 날짜 형식이 아닙니다. YYYY-MM-DD 형식으로 입력하세요.' };
        }

        const newPlanner = await Planner.create({
            start_day: parsedStartDay.format('YYYY-MM-DD'),
            end_day: parsedEndDay ? parsedEndDay.format('YYYY-MM-DD') : null,
            title,
            start_time,
            end_time,
            userEmail
        });

        console.log("생성된 일정 데이터:", newPlanner); // 생성된 일정 확인

        return {
            action: '생성',
            date: parsedStartDay.format('YYYY-MM-DD'),
            start_time,
            end_time,
            title
        };
    } catch (error) {
        console.error("일정 생성 오류:", error.message);
        return { error: "일정 생성 중 오류가 발생했습니다.", details: error.message };
    }
};


exports.getPlannersByDate = async (req, res = null) => {
    const date = req.query?.date || req.date;
    const userEmail = req.user?.email || req.userEmail;

    try {
        const parsedDate = moment(date, 'YYYY-MM-DD', true);
        if (!parsedDate.isValid()) {
            const errorMessage = { error: '올바른 날짜 형식이 아닙니다. YYYY-MM-DD 형식으로 입력하세요.' };
            return res ? res.status(400).json(errorMessage) : errorMessage;
        }

        const planners = await Planner.findAll({
            where: {
                start_day: parsedDate.format('YYYY-MM-DD'),
                userEmail
            },
            order: [['start_time', 'ASC']]
        });

        console.log("조회된 일정 데이터:", planners); // 조회된 일정 확인

        if (res) {
            if (planners.length > 0) {
                const formattedPlanners = planners.map(planner => ({
                    action: '조회',
                    date: planner.start_day,
                    start_time: planner.start_time || '시간 미정',
                    end_time: planner.end_time || '시간 미정',
                    title: planner.title || '제목 없음'
                }));
                return res.status(200).json(formattedPlanners);
            } else {
                return res.status(200).json({ message: '해당 날짜에 일정이 없습니다.' });
            }
        } else {
            return planners.length > 0
                ? planners.map(planner => ({
                    action: '조회',
                    date: planner.start_day,
                    start_time: planner.start_time || '시간 미정',
                    end_time: planner.end_time || '시간 미정',
                    title: planner.title || '제목 없음'
                }))
                : { message: '해당 날짜에 일정이 없습니다.' };
        }
    } catch (error) {
        console.error("일정 조회 중 오류 발생:", error.message);
        const errorMessage = { message: "일정 조회 중 오류가 발생했습니다.", error: error.message };
        return res ? res.status(500).json(errorMessage) : errorMessage;
    }
};


// 특정 ID의 일정을 조회하는 컨트롤러
exports.getPlannerById = async (req, res) => {
    const { id } = req.params;

    try {
        const planner = await Planner.findOne({ where: { id, userEmail: req.user.email } });
        if (planner) {
            res.status(200).json({
                action: '조회',
                date: planner.start_day,
                time: `${planner.start_time} ~ ${planner.end_time}`,
                description: planner.title
            });
        } else {
            res.status(404).json({ message: "일정을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error("일정 ID 조회 오류 발생:", error.message);
        res.status(500).json({ message: "일정 조회 중 오류가 발생했습니다.", error: error.message });
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

        const parsedStartDay = start_day ? moment(start_day, 'YYYY-MM-DD', true) : null;
        const parsedEndDay = end_day ? moment(end_day, 'YYYY-MM-DD', true) : null;
        if (parsedStartDay && !parsedStartDay.isValid()) {
            return res.status(400).json({ error: '올바른 시작 날짜 형식이 아닙니다. YYYY-MM-DD 형식으로 입력하세요.' });
        }
        if (parsedEndDay && !parsedEndDay.isValid()) {
            return res.status(400).json({ error: '올바른 종료 날짜 형식이 아닙니다. YYYY-MM-DD 형식으로 입력하세요.' });
        }

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
            url
        });

        res.status(200).json({
            action: '수정',
            date: planner.start_day,
            time: `${planner.start_time} ~ ${planner.end_time}`,
            description: title
        });
    } catch (error) {
        console.error("일정 수정 중 오류 발생:", error.message);
        res.status(500).json({ message: "일정 수정 중 오류가 발생했습니다.", error: error.message });
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
        res.status(200).json({
            action: '삭제',
            date: planner.start_day,
            description: planner.title
        });
    } catch (error) {
        console.error("일정 삭제 중 오류 발생:", error.message);
        res.status(500).json({ message: "일정 삭제 중 오류가 발생했습니다.", error: error.message });
    }
};

// 특정 년도와 월에 대한 일정 조회 컨트롤러
exports.getPlannersByMonth = async (req, res) => {
    const { year, month } = req.query;
    const userEmail = req.user ? req.user.email : null;

    try {
        if (!year || !month || !moment(`${year}-${month}`, 'YYYY-MM', true).isValid()) {
            return res.status(400).json({ error: '올바른 년도 및 월 형식이 아닙니다. YYYY와 MM 형식으로 입력하세요.' });
        }

        const startOfMonth = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
        const endOfMonth = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');

        const planners = await Planner.findAll({
            where: {
                start_day: { [Op.between]: [startOfMonth, endOfMonth] },
                userEmail
            },
            order: [['start_day', 'ASC'], ['start_time', 'ASC']]
        });

        if (planners.length > 0) {
            const formattedPlanners = planners.map(planner => ({
                action: '조회',
                date: planner.start_day,
                time: `${planner.start_time} ~ ${planner.end_time}`,
                description: planner.title
            }));
            res.status(200).json(formattedPlanners);
        } else {
            res.status(200).json({ message: '해당 월에 일정이 없습니다.' });
        }
    } catch (error) {
        console.error("월간 일정 조회 중 오류 발생:", error.message);
        res.status(500).json({ message: "월간 일정 조회 중 오류가 발생했습니다.", error: error.message });
    }
};
