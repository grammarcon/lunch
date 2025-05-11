// 오늘 날짜를 기본값으로 설정
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    document.getElementById('mealDate').value = formattedDate;
    getMealInfo();
});

async function getMealInfo() {
    const dateInput = document.getElementById('mealDate').value;
    const formattedDate = dateInput.replace(/-/g, '');
    const mealContent = document.getElementById('mealContent');
    
    // 로딩 상태 표시
    mealContent.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>급식 정보를 불러오는 중...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=B10&SD_SCHUL_CODE=7081445&MLSV_YMD=${formattedDate}&Type=json`);
        const data = await response.json();
        
        if (data.RESULT && data.RESULT.CODE === 'INFO-200') {
            mealContent.innerHTML = `
                <div class="no-meal">
                    <i class="fas fa-calendar-times"></i>
                    <p>해당 날짜의 급식 정보가 없습니다.</p>
                </div>
            `;
            return;
        }
        
        if (data.mealServiceDietInfo && data.mealServiceDietInfo[1].row) {
            const mealData = data.mealServiceDietInfo[1].row[0];
            const menu = mealData.DDISH_NM.replace(/<br\/>/g, '\n');
            
            // 급식 정보를 보기 좋게 포맷팅
            const formattedMenu = menu.split('\n').map(item => {
                // 알레르기 정보가 있는 경우 처리
                const allergyMatch = item.match(/\(([^)]+)\)/);
                if (allergyMatch) {
                    const mainItem = item.split('(')[0];
                    const allergyInfo = allergyMatch[1];
                    return `
                        <div class="menu-item">
                            <span class="menu-name">${mainItem}</span>
                            <span class="allergy-info">(${allergyInfo})</span>
                        </div>
                    `;
                }
                return `<div class="menu-item">${item}</div>`;
            }).join('');
            
            mealContent.innerHTML = formattedMenu;
        } else {
            mealContent.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>급식 정보를 불러오는데 실패했습니다.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        mealContent.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>급식 정보를 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}
