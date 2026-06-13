export interface RelationSelectProps<T> {
  label: string;
  value: string[];
  options: T[];
  getLabel: (o: T) => string;
  getValue: (o: T) => string;

  multiple?: boolean;

  onChange: (v: string[]) => void;
}

export default function RelationSelect<T>({
                                            label,
                                            value,
                                            options,
                                            getLabel,
                                            getValue,
                                            onChange,
                                            multiple = true
                                          }: RelationSelectProps<T>) {
  const handleClick = (id: string) => {
    let next = value;

    if (multiple) {
      next = value.includes(id)
          ? value.filter((v) => v !== id)
          : [...value, id];
    } else {
      next = [id];
    }

    onChange(next);
  };

  return (
      <div className="flex flex-col gap-2 my-2">
        <label className="font-medium mb-1 text-white">{label}</label>

        <div className="flex flex-col gap-1 border rounded-lg p-3 bg-white">
          {options.map((opt) => {
            const id = getValue(opt);
            const text = getLabel(opt);
            const checked = value.includes(id);

            return (
                <label key={id} className="flex items-center gap-2">
                  <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleClick(id)}
                  />
                  {text}
                </label>
            );
          })}
        </div>
      </div>
  );
}
