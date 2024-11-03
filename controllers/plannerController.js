const Planner = require('../models/planner');
const moment = require('moment');
moment.locale('ko'); // 로케일 설정

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
            url,
            userEmail
        } = req.body;

        const parsedStartDay = moment(start_day, 'YYYY.MM.DD dddd', true);
        const parsedEndDay = end_day ? moment(end_day, 'YYYY.MM.DD dddd', true) : null;

        if (!parsedStartDay.isValid() || (end_day && !parsedEndDay.isValid())) {
            return res.status(400).json({ error: '올바른 날짜 형식이 아닙니다. YYYY.MM.DD dddd 형식으로 입력하세요.' });
        }

        const newPlanner = await Planner.create({
            start_day: parsedStartDay.format('YYYY-MM-DD'),
            end_day: parsedEndDay ? parsedEndDay.format('YYYY-MM-DD') : null,
            title,
            start_time,
            end_time,
            memo,
            notification,  // ENUM 값 사용 가능
            repeat,
            check_box,
            url,
            userEmail
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


// 특정 ID의 일정을 조회하는 컨트롤러
exports.getPlannerById = async (req, res) => {
    const { id } = req.params;
    const { userEmail } = req.body;

    try {
        const planner = await Planner.findOne({ where: { id, userEmail } });
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
    const { userEmail, ...updateData } = req.body;

    try {
        const planner = await Planner.findOne({ where: { id, userEmail } });
        if (!planner) {
            return res.status(404).json({ message: "일정을 찾을 수 없습니다." });
        }

        await planner.update(updateData);
        res.status(200).json({ message: "일정이 수정되었습니다." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "일정 수정 중 오류가 발생했습니다." });
    }
};

// 일정 삭제 컨트롤러
exports.deletePlannerById = async (req, res) => {
    const { id } = req.params;
    const { userEmail } = req.body;

    try {
        const planner = await Planner.findOne({ where: { id, userEmail } });
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
