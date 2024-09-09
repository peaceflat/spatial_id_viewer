import { Button, TextInput } from 'flowbite-react';
import { ChangeEvent, memo, useId, useState } from 'react';
import { useMount } from 'react-use';

import { OwnerAddressFragmentProps } from '#app/components/area-creator';
import { NavigationButtons } from '#app/components/navigation';
import { OwnerAddressInfo } from '#app/views/overlay-areas/create/interfaces';

export const OwnerAddressFragment = memo(
  ({
    ownerAddressInfo,
    setOwnerAddressInfo,
    navigatePrev,
    navigateNext,
  }: OwnerAddressFragmentProps<OwnerAddressInfo>) => {
    const [rest, setrest] = useState<string>('');
    const [grpc, setgrpc] = useState<string>('');
    const [other, setother] = useState<string>('');

    useMount(() => {
      if (ownerAddressInfo !== null) {
        setrest(ownerAddressInfo.rest);
        setgrpc(ownerAddressInfo.grpc);
        setother(ownerAddressInfo.other);
      }
    });

    const onRestChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setrest(ev.target.value);
    };
    const onGrpcChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setgrpc(ev.target.value);
    };
    const onOtherChange = (ev: ChangeEvent<HTMLInputElement>) => {
      setother(ev.target.value);
    };

    const apply = () => {
      setOwnerAddressInfo({
        rest,
        grpc,
        other,
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

    const restId = useId();
    const grpcId = useId();
    const otherId = useId();

    return (
      <>
        <p>所有者の住所情報を入力してください</p>
        <div>
          <p>
            <label htmlFor={grpcId}>grpc</label>
          </p>
          <TextInput type="text" id={grpcId} required={true} value={grpc} onChange={onGrpcChange} />
        </div>
        <div>
          <p>
            <label htmlFor={restId}>rest</label>
          </p>
          <TextInput type="text" id={restId} required={true} value={rest} onChange={onRestChange} />
        </div>
        <div>
          <p>
            <label htmlFor={otherId}>other</label>
          </p>
          <TextInput
            type="text"
            id={otherId}
            required={true}
            value={other}
            onChange={onOtherChange}
          />
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
