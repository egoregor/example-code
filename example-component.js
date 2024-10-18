import React from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import { useRouter } from 'next/router';
import { useStylesBonusesHistory } from './BonusesHistoryStyles';
import {
  optionsMonthLong,
  optionsMonthYearNumeric,
  formatDate,
  validDateToParse,
  isEmpty,
  formatDatePlusDay,
} from '../../helpers/common-helper';
import { closeCustomPopup } from '../../actions/customPopupAction';
import PopupPatternForEmptyLists
  from '../../components/PopupPatterns/PopupPatternForEmptyLists/PopupPatternForEmptyLists';

const BonusesHistory = ({
  bonusesHistory,
  closeCustomPopupAction,
  bonusesAmount,
}) => {
  const classes = useStylesBonusesHistory();
  const router = useRouter();

  // показывает начисление или сгорание балов
  const defineEnrolmentOrWriteOff = (type, amount) => {
    if (type === 'enrolment') {
      return (
        <p className={cn(classes.bonuses_history__enrolment, classes.bonuses_history__bonuses)}>
          +
          {`${amount}`}
        </p>
      );
    }
    if (type === 'write-off') {
      return (
        <p className={cn(classes.bonuses_history__write_off, classes.bonuses_history__bonuses)}>
          -
          {`${amount}`}
        </p>
      );
    }
    return null;
  };

  const days = bonusesHistory.map((day) => (
    <div key={day.date} className={classes.bonuses_history__container}>
      <p className={`${classes.bonuses_history__small} gray`}>
        {formatDatePlusDay(day.date, optionsMonthLong)}
      </p>
      {day.transactions.map((order) => (
        <div key={order.id}>
          <div className={classes.bonuses_history__bonuses_container}>
            {order.description
              ? (
                <p className={`${classes.bonuses_history__bonuses} text`}>
                  {order.description}
                </p>
              ) : (
                <p className={classes.bonuses_history__bonuses}>
                  Заказ
                  {' '}
                  {order.orderNumber}
                </p>
              )}

            {(order.expiresIn && order.type === 'enrolment') ? (
              <p className={classes.bonuses_history__small}>
                Сгорят
                {` ${formatDatePlusDay(validDateToParse(order.expiresIn), optionsMonthYearNumeric)}`}
              </p>
            ) : null}
          </div>

          <div className={classes.bonuses_history__wrap_icon_and_amount}>
            {order?.icon !== null
              && (
                <div className={classes.bonuses_history__wrap_icon}>
                  <img src={order?.icon} alt="Иконка" />
                </div>
              )}
            {defineEnrolmentOrWriteOff(order.type, order.amount)}
          </div>
        </div>
      ))}
    </div>
  ));

  const title = (
    <div className={classes.bonuses_history__full}>
      <p>История начислений и списаний баллов</p>
      <img
        onClick={() => {
          closeCustomPopupAction(true);
        }}
        className="bonuses_history__info"
        src="/images/icon-information.svg"
        alt="Посмотреть историю бонусов"
        title="Посмотреть историю бонусов"
      />
    </div>
  );

  const textBurn = (
    <div className={classes.bonuses_history__wrap_text_burn}>
      <div className={classes.bonuses_history__wrap_icon}>
        <img src="/images/icon-burn.svg" alt="Иконка" />
      </div>
      <div className={classes.bonuses_history__write_off}>
        {bonusesAmount?.amount}
        {' '}
        баллов сгорят
        {' '}
        {!isEmpty(bonusesAmount?.date) && formatDatePlusDay(bonusesAmount?.date, optionsMonthLong)}
      </div>
    </div>
  );

  return (
    <>
      {!!bonusesHistory.length ? (
        <div className={classes.bonuses_history}>
          {title}
          {bonusesAmount?.amount && textBurn}
          {days}
        </div>
      ) : (
        <PopupPatternForEmptyLists
          onClick={closeCustomPopupAction}
          title={title}
          onTitleClick={() => {
            closeCustomPopupAction(true);
          }}
          btnText="Понятно"
          content="Тут будет история изменения твоих баллов"
        />
      ) }
    </>
  );
};

const mapStateToProps = (state) => ({
  bonusesHistory: state.auth.bonusesHistory,
  bonusesAmount: state.auth.bonusesAmount,
});

const mapDispatchToProps = (dispatch) => ({
  closeCustomPopupAction: (bool) => dispatch(closeCustomPopup(bool)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BonusesHistory);
