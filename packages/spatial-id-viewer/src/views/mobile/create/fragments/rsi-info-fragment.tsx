import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useId, useState } from 'react';
import { useMount } from 'react-use';

import { NavigationButtons } from '#app/components/navigation';
import { RsiInfoFragmentProps } from '#app/components/tab-area-creator';
import { RsiInfo } from '#app/views/mobile/create/interfaces';

export const RsiInfoFragment = memo(
  ({ rsiInfo, setRsiInfo, navigatePrev, navigateNext }: RsiInfoFragmentProps<RsiInfo>) => {
    const [RSI, setRSI] = useState<number>(0);

    useMount(() => {
      if (rsiInfo !== null) {
        setRSI(rsiInfo.rsi);
      }
    });

    const onRsiChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setRSI(ev.target.valueAsNumber);
    };

    const apply = () => {
      setRsiInfo({
        rsi: RSI,
      });
    };

    const onBackButtonClick = () => {
      apply();
      navigatePrev();
    };

    const onNextButtonClick = () => {
      apply();
      navigateNext();
    };

    const RSIId = useId();

    return (
      <>
        <p>RSI情報を入力してください</p>
        <div>
          <p>
            <label htmlFor={RSIId}>RSI</label>
          </p>
          <TextInput type="number" id={RSIId} required={true} value={RSI} onChange={onRsiChange} />
        </div>

        <NavigationButtons>
          <Button color="dark" onClick={onBackButtonClick}>
            前へ
          </Button>
          <Button onClick={onNextButtonClick}>確定</Button>
        </NavigationButtons>
      </>
    );
  }
);
