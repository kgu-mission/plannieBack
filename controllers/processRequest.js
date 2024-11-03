// controllers/processRequest.js
const Planner = require('../models/Planner'); // Planner 모델 임포트
const { getOpenAIResponse } = require('../openai'); // OpenAI API와 연결
const moment = require('moment'); // 날짜 형식 파싱을 위해 moment.js 사용

// 사용자 메시지를 OpenAI로 분석하여 명령어를 파싱
async function analyzeUserMessage(message) {
    const response = await getOpenAIResponse(message);
    const parsedCommand = JSON.parse(response); // OpenAI 응답을 JSON 형식으로 파싱
    return parsedCommand;
}

// 파싱된 명령어에 따라 일정 작업을 수행
async function executeCalendarCommand(command, userEmail) {
    let response = '';

    switch (command.action) {
        case 'view':
            const parsedDate = moment(command.date, 'YYYY.MM.DD', true); // 날짜 형식 확인
            if (!parsedDate.isValid()) {
                return "유효하지 않은 날짜 형식입니다. YYYY.MM.DD 형식으로 입력하세요.";
            }
            const schedules = await Planner.findAll({
                where: { start_day: parsedDate.format('YYYY-MM-DD'), userEmail },
                order: [['start_time', 'ASC']]
            });
            response = schedules.length
                ? `${command.date}의 일정 목록은 다음과 같습니다:\n` +
                schedules.map(schedule => `- ${schedule.start_time} ~ ${schedule.end_time}: ${schedule.title}`).join('\n')
                : `${command.date}에 예정된 일정이 없습니다.`;
            break;

        case 'add':
            await Planner.create({
                title: command.title,
                start_day: command.date,
                start_time: command.start_time,
                end_time: command.end_time,
                userEmail // 사용자 이메일 추가
            });
            response = `${command.date}에 ${command.start_time} ~ ${command.end_time}로 "${command.title}" 일정이 추가되었습니다.`;
            break;

        case 'update':
            const scheduleToUpdate = await Planner.findOne({ where: { id: command.id, userEmail } });
            if (scheduleToUpdate) {
                await scheduleToUpdate.update({
                    start_time: command.start_time || scheduleToUpdate.start_time,
                    end_time: command.end_time || scheduleToUpdate.end_time,
                    title: command.title || scheduleToUpdate.title
                });
                response = `"${scheduleToUpdate.title}" 일정이 업데이트되었습니다.`;
            } else {
                response = "수정할 일정을 찾을 수 없습니다.";
            }
            break;

        case 'delete':
            const scheduleToDelete = await Planner.findOne({ where: { id: command.id, userEmail } });
            if (scheduleToDelete) {
                await scheduleToDelete.destroy();
                response = `${scheduleToDelete.start_time} ~ ${scheduleToDelete.end_time}에 계획된 "${scheduleToDelete.title}" 일정이 삭제되었습니다.`;
            } else {
                response = "삭제할 일정을 찾을 수 없습니다.";
            }
            break;

        default:
            response = "유효하지 않은 명령입니다.";
    }

    return response;
}

module.exports = { analyzeUserMessage, executeCalendarCommand };
