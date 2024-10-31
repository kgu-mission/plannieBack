const Planner = require('../models/planner'); // Planner 모델 불러오기

// 새로운 일정 생성
exports.createPlanner = async (req, res) => {
    const { title, start_day, end_day, start_time, end_time, memo, notification, repeat, check_box } = req.body;

    try {
        const newPlanner = await Planner.create({
            title,
            start_day,
            end_day,
            start_time,
            end_time,
            memo,
            notification,
            repeat,
            check_box
        });
        res.status(201).json({ message: '일정이 생성되었습니다.', planner: newPlanner });
    } catch (error) {
        res.status(500).json({ message: '일정 생성 중 오류가 발생했습니다.', error });
    }
};

// 특정 ID의 일정 조회
exports.getPlannerById = async (req, res) => {
    try {
        const planner = await Planner.findByPk(req.params.id);
        if (!planner) {
            return res.status(404).json({ message: '일정을 찾을 수 없습니다.' });
        }
        res.json(planner);
    } catch (error) {
        res.status(500).json({ message: '일정 조회 중 오류가 발생했습니다.', error });
    }
};

// 특정 ID의 일정 수정
exports.updatePlannerById = async (req, res) => {
    const { title, start_day, end_day, start_time, end_time, memo, notification, repeat, check_box } = req.body;

    try {
        const planner = await Planner.findByPk(req.params.id);
        if (!planner) {
            return res.status(404).json({ message: '일정을 찾을 수 없습니다.' });
        }

        await planner.update({ title, start_day, end_day, start_time, end_time, memo, notification, repeat, check_box });
        res.json({ message: '일정이 수정되었습니다.', planner });
    } catch (error) {
        res.status(500).json({ message: '일정 수정 중 오류가 발생했습니다.', error });
    }
};

// 특정 ID의 일정 삭제
exports.deletePlannerById = async (req, res) => {
    try {
        const planner = await Planner.findByPk(req.params.id);
        if (!planner) {
            return res.status(404).json({ message: '일정을 찾을 수 없습니다.' });
        }

        await planner.destroy();
        res.json({ message: '일정이 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '일정 삭제 중 오류가 발생했습니다.', error });
    }
};
