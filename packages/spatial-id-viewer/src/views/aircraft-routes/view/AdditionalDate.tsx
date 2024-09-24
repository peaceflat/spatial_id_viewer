import { TextInput } from 'flowbite-react';
import { ChangeEvent, memo } from 'react';
import { useStore } from 'zustand';
import { shallow } from 'zustand/shallow';

import { WithStore } from '#app/components/area-creator/store';
import { useStoreApi } from '#app/components/area-viewer/store';
import { WithAuthGuard } from '#app/components/auth-guard';
import { TogglableDateTimeInputField } from '#app/components/togglable-date-time-input-field';

/** 追加の設定の入力欄 */
const AdditionalDateSettings = memo(() => {
  const store = useStoreApi();
  const [startTime, endTime, update] = useStore(
    store,
    (s) => [s.startTime, s.endTime, s.update],
    shallow
  );

  const onStartTimeChange = (startTime: Date) => {
    update((s) => (s.startTime = startTime));
  };

  const onEndTimeChange = (endTime: Date) => {
    update((s) => (s.endTime = endTime));
  };

  return (
    <>
      <TogglableDateTimeInputField
        name="開始日時"
        selected={startTime}
        onChange={onStartTimeChange}
      />

      <TogglableDateTimeInputField name="終了日時" selected={endTime} onChange={onEndTimeChange} />
    </>
  );
});

export default WithAuthGuard(WithStore(AdditionalDateSettings));
